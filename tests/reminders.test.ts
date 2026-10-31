import { expect, test } from '@jest/globals';

import {
  DAY_PRESETS,
  adjustTimeByMinutes,
  computeReminderStats,
  computeShiftedSchedule,
  decodeReminders,
  encodeReminders,
  formatTimeUntilNext,
  isDue,
  isPreReminderDue,
  localDate,
  nextTriggerMs,
  occurrenceKey,
  preOccurrenceKey,
  reminderAccentColors,
  validTime,
  validateReminderDraft,
  type Reminder,
} from '../src/domain/reminders';

const reminder: Reminder = { id: 'test', name: 'Teste', time: '08:00', days: [1, 3, 5], dose: '', active: true };

test('agenda no mesmo dia quando o horário ainda não passou', () => {
  expect(nextTriggerMs('08:00', [1, 3, 5], new Date(2026, 8, 21, 7))).toBe(new Date(2026, 8, 21, 8).getTime());
});
test('pula dias não selecionados após o horário e cruza semana/mês', () => {
  expect(nextTriggerMs('08:00', [1, 3, 5], new Date(2026, 8, 21, 9))).toBe(new Date(2026, 8, 23, 8).getTime());
  expect(nextTriggerMs('08:00', [1], new Date(2026, 8, 28, 8))).toBe(new Date(2026, 9, 5, 8).getTime());
});
test('rejeita horários e dias inválidos', () => {
  for (const value of ['', '24:00', '08:60', '8:00']) expect(validTime(value)).toBe(false);
  expect(() => nextTriggerMs('08:00', [])).toThrow();
  expect(() => nextTriggerMs('08:00', [7])).toThrow();
});
test('serialização preserva edição, pausa e registro diário', () => {
  const items = [{ ...reminder, active: false, notes: 'Observação', takenDate: '2026-09-21' }];
  expect(decodeReminders(encodeReminders(items))).toEqual(items);
  expect(decodeReminders(null)).toEqual([]);
});
test('dados corrompidos ou versões desconhecidas não são aceitos silenciosamente', () => {
  for (const raw of ['{', '{}', '{"version":2,"reminders":[]}', JSON.stringify({ version: 1, reminders: [{ ...reminder, days: [] }] }), JSON.stringify({ version: 1, reminders: [reminder, reminder] })]) {
    expect(() => decodeReminders(raw)).toThrow();
  }
});
test('alerta só no minuto e no dia agendados, sem recuperar alertas antigos', () => {
  expect(isDue(reminder, new Date(2026, 8, 21, 8, 0, 30))).toBe(true);
  expect(isDue(reminder, new Date(2026, 8, 22, 8))).toBe(false);
  expect(isDue(reminder, new Date(2026, 8, 21, 8, 1))).toBe(false);
  expect(isDue({ ...reminder, active: false }, new Date(2026, 8, 21, 8))).toBe(false);
});
test('não repete aviso emitido/tomado, mas funciona no próximo dia', () => {
  const now = new Date(2026, 8, 21, 8);
  expect(isDue({ ...reminder, notifiedAt: occurrenceKey(reminder, now) }, now)).toBe(false);
  expect(isDue({ ...reminder, takenDate: localDate(now) }, now)).toBe(false);
  expect(isDue({ ...reminder, takenDate: localDate(now), notifiedAt: occurrenceKey(reminder, now) }, new Date(2026, 8, 23, 8))).toBe(true);
});
test('registro diário usa data local na virada do dia', () => {
  expect(localDate(new Date(2026, 8, 21, 23, 59))).toBe('2026-09-21');
  expect(localDate(new Date(2026, 8, 22, 0, 0))).toBe('2026-09-22');
});
test('calcula contadores de total, ativos e tomados hoje sem contar dias anteriores', () => {
  const now = new Date(2026, 9, 31, 10, 0);
  const today = localDate(now);
  const items: Reminder[] = [
    { ...reminder, id: '1', active: true, takenDate: today },
    { ...reminder, id: '2', active: false, takenDate: today },
    { ...reminder, id: '3', active: true, takenDate: '2026-10-30' },
    { ...reminder, id: '4', active: true },
  ];
  expect(computeReminderStats(items, now)).toEqual({ total: 4, active: 3, takenToday: 2 });
});
test('formata tempo restante para o próximo horário ou estado pausado', () => {
  const now = new Date(2026, 9, 31, 10, 53);
  expect(formatTimeUntilNext({ ...reminder, active: false }, now)).toBe('Pausado');
  expect(formatTimeUntilNext({ ...reminder, days: [...DAY_PRESETS.all], time: '12:00' }, now)).toBe('em 1h 7min');
  expect(formatTimeUntilNext({ ...reminder, days: [...DAY_PRESETS.all], time: '11:00' }, now)).toBe('em 7min');
  expect(formatTimeUntilNext({ ...reminder, days: [...DAY_PRESETS.all], time: '12:53' }, now)).toBe('em 2h');
  expect(formatTimeUntilNext({ ...reminder, days: [1], time: '08:00' }, now)).toBe('em 1d 21h');
});
test('calcula agenda 30 minutos antes inclusive cruzando meia-noite e domingo/sábado', () => {
  expect(computeShiftedSchedule('08:00', [1, 3, 5], 30)).toEqual({
    hour: 7, minute: 30, time: '07:30', days: [1, 3, 5],
  });
  expect(computeShiftedSchedule('00:15', [0, 1], 30)).toEqual({
    hour: 23, minute: 45, time: '23:45', days: [0, 6],
  });
  expect(() => computeShiftedSchedule('99:00', [1], 30)).toThrow();
});
test('detecta alerta antecipado de 30 minutos apenas quando elegível e não tomado', () => {
  const target = new Date(2026, 8, 21, 8, 0, 0);
  const thirtyBefore = new Date(2026, 8, 21, 7, 30, 15);
  expect(isPreReminderDue(reminder, thirtyBefore)).toBe(true);
  expect(isPreReminderDue({ ...reminder, active: false }, thirtyBefore)).toBe(false);
  expect(isPreReminderDue({ ...reminder, takenDate: localDate(target) }, thirtyBefore)).toBe(false);
  expect(isPreReminderDue(reminder, thirtyBefore, preOccurrenceKey(reminder, target))).toBe(false);
  expect(isPreReminderDue(reminder, new Date(2026, 8, 21, 7, 31, 0))).toBe(false);
});
test('valida rascunho do formulário, respeita limites e preserva metadados na edição', () => {
  const invalid = validateReminderDraft({
    id: 'n1', name: '   ', dose: 'x'.repeat(161), time: '25:00', days: [], notes: 'y'.repeat(501), active: true,
  });
  expect(invalid.ok).toBe(false);
  if (!invalid.ok) {
    expect(invalid.firstField).toBe('name');
    expect(invalid.errors).toEqual({
      name: 'Informe o nome do lembrete',
      dose: 'A dosagem deve ter no máximo 160 caracteres',
      time: 'Informe um horário válido',
      days: 'Selecione ao menos um dia da semana',
      notes: 'As observações devem ter no máximo 500 caracteres',
    });
  }
  const tooLongName = validateReminderDraft({
    id: 'n2', name: 'a'.repeat(121), dose: '', time: '08:00', days: [1], notes: '', active: true,
  });
  expect(tooLongName.ok).toBe(false);

  const existing: Reminder = {
    id: 'orig-1', name: 'Antigo', dose: '10mg', time: '08:00', days: [1], active: true,
    takenDate: '2026-10-31', notifiedAt: '2026-10-31T08:00',
  };
  const valid = validateReminderDraft({
    id: 'ignored', name: '  Losartana  ', dose: ' 50mg ', time: '09:30',
    days: [5, 1, 3, 1], notes: ' Tomar com água ', active: false,
  }, existing);
  expect(valid.ok).toBe(true);
  if (valid.ok) {
    expect(valid.reminder).toEqual({
      id: 'orig-1',
      name: 'Losartana',
      dose: '50mg',
      time: '09:30',
      days: [1, 3, 5],
      notes: 'Tomar com água',
      active: false,
      takenDate: '2026-10-31',
      notifiedAt: '2026-10-31T08:00',
    });
  }
});
test('ajusta horário em minutos com volta de 24h e mantém cor estável por ID', () => {
  expect(adjustTimeByMinutes('00:05', -15)).toBe('23:50');
  expect(adjustTimeByMinutes('23:50', 15)).toBe('00:05');
  expect(adjustTimeByMinutes('invalido', 15)).toBe('08:15');
  expect(reminderAccentColors('abc-123')).toEqual(reminderAccentColors('abc-123'));
});
