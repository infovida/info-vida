import { describe, expect, it, jest } from '@jest/globals';

import { STORAGE_KEY, type Reminder } from '../src/domain/reminders';
import {
  ReminderDataCorruptedError,
  ReminderStorageError,
  createLocalReminderRepository,
  generateReminderId,
  type KeyValueStorage,
} from '../src/features/reminders/localReminderRepository';
import {
  SCHEDULES_STORAGE_KEY,
  buildReminderNotificationPayloads,
  createReminderNotificationService,
  type NotificationPlatformDriver,
  type ScheduledAlertSpec,
} from '../src/features/reminders/reminderNotifications';

function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { dump: () => Record<string, string> } {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: async key => map.get(key) ?? null,
    setItem: async (key, value) => { map.set(key, value); },
    dump: () => Object.fromEntries(map.entries()),
  };
}

const sampleA: Reminder = {
  id: 'rem-a',
  name: 'Losartana',
  dose: '50mg — 1 comprimido',
  time: '08:00',
  days: [1, 3, 5],
  notes: 'Após o café da manhã',
  active: true,
};

const sampleB: Reminder = {
  id: 'rem-b',
  name: 'Vitamina D',
  dose: '2000UI',
  time: '12:00',
  days: [0, 1, 2, 3, 4, 5, 6],
  active: true,
};

describe('persistência local e notificações de lembretes', () => {
  it('gera IDs únicos, insere mais recentes primeiro, edita sem reordenar e serializa concorrência', async () => {
    expect(generateReminderId()).not.toBe(generateReminderId());
    const storage = createMemoryStorage();
    const repo = createLocalReminderRepository(storage);

    await Promise.all([repo.save(sampleA), repo.save(sampleB)]);
    const afterInsert = await repo.list();
    expect(afterInsert.map(item => item.id)).toEqual(['rem-b', 'rem-a']);

    await repo.save({ ...sampleA, dose: '100mg' });
    const afterEdit = await repo.list();
    expect(afterEdit.map(item => item.id)).toEqual(['rem-b', 'rem-a']);
    expect(afterEdit[1].dose).toBe('100mg');

    await repo.remove('rem-b');
    await repo.remove('inexistente');
    expect((await repo.list()).map(item => item.id)).toEqual(['rem-a']);
  });

  it('preserva dados corrompidos e erros de leitura/gravação sem sobrescrever storage', async () => {
    const corrupted = createMemoryStorage({ [STORAGE_KEY]: '{"version":99}' });
    const corruptedRepo = createLocalReminderRepository(corrupted);
    await expect(corruptedRepo.list()).rejects.toBeInstanceOf(ReminderDataCorruptedError);
    await expect(corruptedRepo.save(sampleA)).rejects.toBeInstanceOf(ReminderDataCorruptedError);
    expect(corrupted.dump()[STORAGE_KEY]).toBe('{"version":99}');

    const failingRead: KeyValueStorage = {
      getItem: async () => { throw new Error('IO read error'); },
      setItem: async () => undefined,
    };
    await expect(createLocalReminderRepository(failingRead).list()).rejects.toBeInstanceOf(ReminderStorageError);

    const backing = createMemoryStorage();
    const writeOnce = createLocalReminderRepository({
      getItem: backing.getItem,
      setItem: async () => { throw new Error('Disk full'); },
    });
    await expect(writeOnce.save(sampleA)).rejects.toBeInstanceOf(ReminderStorageError);
    expect(backing.dump()[STORAGE_KEY]).toBeUndefined();

    await expect(
      createLocalReminderRepository(backing).save({ ...sampleA, time: '99:99' }),
    ).rejects.toThrow();
  });

  it('agenda alertas 30 min antes e na hora sem expor dados sensíveis e cancela ao pausar/excluir', async () => {
    const payloads = buildReminderNotificationPayloads(sampleA);
    expect(payloads).toHaveLength(2);
    expect(payloads[0].stage).toBe('pre30');
    expect(payloads[0].schedule).toEqual({ hour: 7, minute: 30, time: '07:30', days: [1, 3, 5] });
    expect(payloads[1].stage).toBe('due');
    expect(payloads[1].schedule).toEqual({ hour: 8, minute: 0, time: '08:00', days: [1, 3, 5] });

    for (const spec of payloads) {
      const serialized = JSON.stringify(spec);
      expect(serialized).not.toContain(sampleA.name);
      expect(serialized).not.toContain(sampleA.dose);
      expect(serialized).not.toContain(sampleA.notes!);
    }

    const storage = createMemoryStorage();
    const scheduledSpecs: ScheduledAlertSpec[] = [];
    const cancelledIds: string[] = [];
    let counter = 0;

    const driver: NotificationPlatformDriver = {
      kind: 'native',
      getPermission: async () => 'granted',
      requestPermission: async () => 'granted',
      openSettings: jest.fn(async () => undefined),
      scheduleAlert: async spec => {
        scheduledSpecs.push(spec);
        return spec.schedule.days.map(day => `os-${spec.stage}-${day}-${++counter}`);
      },
      cancelAlerts: async ids => { cancelledIds.push(...ids); },
    };

    const service = createReminderNotificationService({ storage, driver });
    expect(await service.getPermission()).toBe('granted');
    expect(await service.isEnabled()).toBe(true);
    expect(await service.openSettings()).toBe(true);

    const res = await service.syncReminder(sampleA, true);
    expect(res.scheduled).toBe(true);
    expect(scheduledSpecs.map(s => s.stage)).toEqual(['pre30', 'due']);
    expect(JSON.parse(storage.dump()[SCHEDULES_STORAGE_KEY]).byReminderId['rem-a']).toHaveLength(6);

    await service.syncReminder({ ...sampleA, active: false }, true);
    expect(cancelledIds).toHaveLength(6);
    expect(JSON.parse(storage.dump()[SCHEDULES_STORAGE_KEY]).byReminderId['rem-a']).toBeUndefined();

    await service.syncReminder(sampleB, true);
    expect(JSON.parse(storage.dump()[SCHEDULES_STORAGE_KEY]).byReminderId['rem-b']).toHaveLength(14);
    await service.cancelReminder('rem-b');
    expect(JSON.parse(storage.dump()[SCHEDULES_STORAGE_KEY]).byReminderId['rem-b']).toBeUndefined();
  });

  it('reporta falha de agendamento sem perder estado e emite alertas web em primeiro plano 30 min antes e na hora', async () => {
    const storage = createMemoryStorage();
    let failSecond = true;
    const cancelled: string[] = [];
    const failingDriver: NotificationPlatformDriver = {
      kind: 'native',
      getPermission: async () => 'granted',
      requestPermission: async () => 'granted',
      scheduleAlert: async spec => {
        if (failSecond && spec.stage === 'due') throw new Error('Alarm limit');
        return [`ok-${spec.stage}`];
      },
      cancelAlerts: async ids => { cancelled.push(...ids); },
    };

    const failingService = createReminderNotificationService({ storage, driver: failingDriver });
    const syncRes = await failingService.syncAll([sampleA], true);
    expect(syncRes.failedIds).toEqual(['rem-a']);
    expect(cancelled).toContain('ok-pre30');

    failSecond = false;
    const retryRes = await failingService.syncAll([sampleA], true);
    expect(retryRes.failedIds).toEqual([]);

    const emitted: { title: string; body: string }[] = [];
    const webDriver: NotificationPlatformDriver = {
      kind: 'web',
      getPermission: async () => 'granted',
      requestPermission: async () => 'granted',
      scheduleAlert: async spec => [`w-${spec.stage}`],
      cancelAlerts: async () => undefined,
      notifyImmediate: (title, body) => { emitted.push({ title, body }); },
    };
    const webService = createReminderNotificationService({ storage: createMemoryStorage(), driver: webDriver });
    const preTime = new Date(2026, 8, 21, 7, 30, 10); // Segunda-feira 07:30 (30 min antes de 08:00)
    webService.checkForegroundAlerts([sampleA], preTime);
    webService.checkForegroundAlerts([sampleA], preTime); // idempotente no mesmo minuto
    expect(emitted).toHaveLength(1);
    expect(emitted[0].title).toContain('30 minutos');

    const dueTime = new Date(2026, 8, 21, 8, 0, 5); // Segunda-feira 08:00
    webService.checkForegroundAlerts([sampleA], dueTime);
    webService.checkForegroundAlerts([sampleA], dueTime);
    expect(emitted).toHaveLength(2);
    expect(emitted[1].title).toContain('Horário do lembrete');
  });
});
