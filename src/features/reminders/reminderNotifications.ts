import AsyncStorage from '@react-native-async-storage/async-storage';
import type * as ExpoNotifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import {
  PRE_REMINDER_MINUTES,
  STORAGE_KEY,
  computeShiftedSchedule,
  decodeReminders,
  isDue,
  isPreReminderDue,
  localDate,
  occurrenceKey,
  preOccurrenceKey,
  type Reminder,
  type ShiftedSchedule,
} from '../../domain/reminders';
import type { KeyValueStorage } from './localReminderRepository';

export type NotificationPermissionState = 'undetermined' | 'granted' | 'denied' | 'unavailable';

export interface ScheduledAlertSpec {
  stage: 'pre30' | 'due';
  advanceMinutes: number;
  title: string;
  body: string;
  data: { kind: 'reminder'; reminderId: string; stage: 'pre30' | 'due' };
  schedule: ShiftedSchedule;
}

export interface NotificationPlatformDriver {
  kind: 'native' | 'web' | 'unavailable';
  getPermission(): Promise<NotificationPermissionState>;
  requestPermission(): Promise<NotificationPermissionState>;
  openSettings?(): Promise<void>;
  scheduleAlert(spec: ScheduledAlertSpec): Promise<readonly string[]>;
  cancelAlerts(notificationIds: readonly string[]): Promise<void>;
  notifyImmediate?(title: string, body: string): void;
}

export interface ReminderNotificationService {
  getPermission(): Promise<NotificationPermissionState>;
  requestPermission(): Promise<NotificationPermissionState>;
  isEnabled(): Promise<boolean>;
  setEnabled(enabled: boolean): Promise<void>;
  openSettings(): Promise<boolean>;
  syncReminder(reminder: Reminder, allowSchedule: boolean): Promise<{ scheduled: boolean }>;
  cancelReminder(reminderId: string): Promise<void>;
  syncAll(reminders: readonly Reminder[], allowSchedule: boolean): Promise<{ failedIds: string[] }>;
  checkForegroundAlerts(reminders: readonly Reminder[], now?: Date): void;
}

export const SCHEDULES_STORAGE_KEY = 'infovida.reminders.schedules.v1';
export const NOTIFICATIONS_ENABLED_KEY = 'infovida.reminders.notifications.v1';
export const ANDROID_CHANNEL_ID = 'infovida-reminders';

/**
 * Privacy rule (PRD-003 / PRD-010 LE07 / PRD-011):
 * External OS notifications never expose medication name, dosage, or notes.
 */
export function buildReminderNotificationPayloads(reminder: Reminder): readonly [ScheduledAlertSpec, ScheduledAlertSpec] {
  return [
    {
      stage: 'pre30',
      advanceMinutes: PRE_REMINDER_MINUTES,
      title: 'InfoVida — Lembrete em 30 minutos',
      body: 'InfoVida: lembrete agendado para daqui a 30 minutos. Abra o aplicativo para consultar seus lembretes.',
      data: { kind: 'reminder', reminderId: reminder.id, stage: 'pre30' },
      schedule: computeShiftedSchedule(reminder.time, reminder.days, PRE_REMINDER_MINUTES),
    },
    {
      stage: 'due',
      advanceMinutes: 0,
      title: 'InfoVida — Horário do lembrete',
      body: 'InfoVida: lembrete agendado. Abra o aplicativo para consultar seus lembretes.',
      data: { kind: 'reminder', reminderId: reminder.id, stage: 'due' },
      schedule: computeShiftedSchedule(reminder.time, reminder.days, 0),
    },
  ];
}

interface StoredSchedules {
  version: 1;
  byReminderId: Record<string, string[]>;
}

async function readScheduleMap(storage: KeyValueStorage): Promise<Record<string, string[]>> {
  try {
    const raw = await storage.getItem(SCHEDULES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StoredSchedules>;
    if (parsed?.version !== 1 || !parsed.byReminderId || typeof parsed.byReminderId !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed.byReminderId).filter(
        ([, ids]) => Array.isArray(ids) && ids.every(id => typeof id === 'string'),
      ),
    );
  } catch {
    return {};
  }
}

async function writeScheduleMap(storage: KeyValueStorage, byReminderId: Record<string, string[]>): Promise<void> {
  const payload: StoredSchedules = { version: 1, byReminderId };
  await storage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(payload));
}

function createNativeDriver(storage: KeyValueStorage): NotificationPlatformDriver {
  let cachedModule: typeof ExpoNotifications | null = null;
  let handlerConfigured = false;
  let channelConfigured = false;

  const loadModule = (): typeof ExpoNotifications | null => {
    if (cachedModule) return cachedModule;
    try {
      // Dynamic require avoids executing DevicePushTokenAutoRegistration side effects on Web/Jest.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cachedModule = require('expo-notifications') as typeof ExpoNotifications;
      if (!handlerConfigured && cachedModule.setNotificationHandler) {
        handlerConfigured = true;
        cachedModule.setNotificationHandler({
          handleNotification: async notification => {
            const reminderId = notification.request.content.data?.reminderId;
            let alreadyTakenToday = false;
            if (typeof reminderId === 'string') {
              try {
                const items = decodeReminders(await storage.getItem(STORAGE_KEY));
                const match = items.find(item => item.id === reminderId);
                alreadyTakenToday = match?.takenDate === localDate(new Date());
              } catch {
                alreadyTakenToday = false;
              }
            }
            return {
              shouldShowBanner: !alreadyTakenToday,
              shouldShowList: !alreadyTakenToday,
              shouldPlaySound: !alreadyTakenToday,
              shouldSetBadge: false,
            };
          },
        });
      }
      return cachedModule;
    } catch {
      return null;
    }
  };

  const ensureChannel = async (mod: typeof ExpoNotifications) => {
    if (Platform.OS !== 'android' || channelConfigured) return;
    await mod.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Lembretes de medicamentos',
      importance: mod.AndroidImportance?.HIGH ?? 4,
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: mod.AndroidNotificationVisibility?.PRIVATE ?? 0,
    });
    channelConfigured = true;
  };

  const mapStatus = (response: ExpoNotifications.NotificationPermissionsStatus): NotificationPermissionState => {
    if (response.granted || response.status === 'granted') return 'granted';
    if (response.status === 'denied' || response.canAskAgain === false) return 'denied';
    return 'undetermined';
  };

  return {
    kind: 'native',
    async getPermission() {
      const mod = loadModule();
      if (!mod) return 'unavailable';
      try {
        return mapStatus(await mod.getPermissionsAsync());
      } catch {
        return 'unavailable';
      }
    },
    async requestPermission() {
      const mod = loadModule();
      if (!mod) return 'unavailable';
      try {
        const current = await mod.getPermissionsAsync();
        if (current.granted || current.status === 'granted') return 'granted';
        if (current.status === 'denied' && current.canAskAgain === false) return 'denied';
        return mapStatus(await mod.requestPermissionsAsync({
          ios: { allowAlert: true, allowSound: true, allowBadge: false },
        }));
      } catch {
        return 'unavailable';
      }
    },
    async openSettings() {
      await Linking.openSettings();
    },
    async scheduleAlert(spec) {
      const mod = loadModule();
      if (!mod) throw new Error('Serviço de notificações indisponível');
      await ensureChannel(mod);
      const ids: string[] = [];
      if (spec.schedule.days.length === 7) {
        const id = await mod.scheduleNotificationAsync({
          content: { title: spec.title, body: spec.body, data: spec.data, sound: 'default' },
          trigger: {
            type: mod.SchedulableTriggerInputTypes.DAILY,
            channelId: ANDROID_CHANNEL_ID,
            hour: spec.schedule.hour,
            minute: spec.schedule.minute,
          },
        });
        ids.push(id);
      } else {
        for (const day of spec.schedule.days) {
          const id = await mod.scheduleNotificationAsync({
            content: { title: spec.title, body: spec.body, data: spec.data, sound: 'default' },
            trigger: {
              type: mod.SchedulableTriggerInputTypes.WEEKLY,
              channelId: ANDROID_CHANNEL_ID,
              weekday: day + 1,
              hour: spec.schedule.hour,
              minute: spec.schedule.minute,
            },
          });
          ids.push(id);
        }
      }
      return ids;
    },
    async cancelAlerts(notificationIds) {
      const mod = loadModule();
      if (!mod) return;
      await Promise.all(
        notificationIds.map(id => mod.cancelScheduledNotificationAsync(id).catch(() => undefined)),
      );
    },
  };
}

function createWebDriver(): NotificationPlatformDriver {
  const getWebNotification = () =>
    typeof globalThis !== 'undefined' && 'Notification' in globalThis
      ? (globalThis as unknown as { Notification: typeof Notification }).Notification
      : null;

  const mapWebPermission = (perm: NotificationPermission): NotificationPermissionState => {
    if (perm === 'granted') return 'granted';
    if (perm === 'denied') return 'denied';
    return 'undetermined';
  };

  return {
    kind: getWebNotification() ? 'web' : 'unavailable',
    async getPermission() {
      const WebNotification = getWebNotification();
      if (!WebNotification) return 'unavailable';
      return mapWebPermission(WebNotification.permission);
    },
    async requestPermission() {
      const WebNotification = getWebNotification();
      if (!WebNotification) return 'unavailable';
      try {
        const result = await WebNotification.requestPermission();
        return mapWebPermission(result);
      } catch {
        return 'unavailable';
      }
    },
    async scheduleAlert(spec) {
      return [`web-${spec.data.reminderId}-${spec.stage}`];
    },
    async cancelAlerts() {
      // Web alerts fire in foreground via checkForegroundAlerts without background OS alarms.
    },
    notifyImmediate(title, body) {
      const WebNotification = getWebNotification();
      if (!WebNotification || WebNotification.permission !== 'granted') return;
      try {
        new WebNotification(title, { body });
      } catch {
        // Ignore browser notification constructor restrictions (e.g. mobile service worker context).
      }
    },
  };
}

export function createReminderNotificationService(options?: {
  storage?: KeyValueStorage;
  driver?: NotificationPlatformDriver;
}): ReminderNotificationService {
  const storage = options?.storage ?? AsyncStorage;
  const driver = options?.driver ?? (
    Platform.OS === 'web' ? createWebDriver() : createNativeDriver(storage)
  );
  let queue: Promise<unknown> = Promise.resolve();
  const emittedWebKeys = new Set<string>();

  const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
    const next = queue.then(operation, operation);
    queue = next.then(() => undefined, () => undefined);
    return next;
  };

  const syncSingleInternal = async (
    reminder: Reminder,
    allowSchedule: boolean,
    scheduleMap: Record<string, string[]>,
  ): Promise<boolean> => {
    const previousIds = scheduleMap[reminder.id] ?? [];
    if (previousIds.length > 0) {
      await driver.cancelAlerts(previousIds);
      delete scheduleMap[reminder.id];
    }
    if (!allowSchedule || !reminder.active) {
      return true;
    }
    const specs = buildReminderNotificationPayloads(reminder);
    const createdIds: string[] = [];
    try {
      for (const spec of specs) {
        const ids = await driver.scheduleAlert(spec);
        createdIds.push(...ids);
      }
      scheduleMap[reminder.id] = createdIds;
      return true;
    } catch {
      if (createdIds.length > 0) {
        await driver.cancelAlerts(createdIds).catch(() => undefined);
      }
      delete scheduleMap[reminder.id];
      return false;
    }
  };

  return {
    getPermission: () => driver.getPermission(),
    requestPermission: () => driver.requestPermission(),

    async isEnabled() {
      try {
        const raw = await storage.getItem(NOTIFICATIONS_ENABLED_KEY);
        if (raw === 'false') return false;
        if (raw === 'true') return true;
        const perm = await driver.getPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    },

    async setEnabled(enabled: boolean) {
      await storage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
    },

    async openSettings() {
      if (!driver.openSettings) return false;
      try {
        await driver.openSettings();
        return true;
      } catch {
        return false;
      }
    },

    syncReminder: (reminder, allowSchedule) => enqueue(async () => {
      const scheduleMap = await readScheduleMap(storage);
      const scheduled = await syncSingleInternal(reminder, allowSchedule, scheduleMap);
      await writeScheduleMap(storage, scheduleMap).catch(() => undefined);
      return { scheduled };
    }),

    cancelReminder: reminderId => enqueue(async () => {
      const scheduleMap = await readScheduleMap(storage);
      const previousIds = scheduleMap[reminderId] ?? [];
      if (previousIds.length > 0) {
        await driver.cancelAlerts(previousIds);
        delete scheduleMap[reminderId];
        await writeScheduleMap(storage, scheduleMap).catch(() => undefined);
      }
    }),

    syncAll: (reminders, allowSchedule) => enqueue(async () => {
      const scheduleMap = await readScheduleMap(storage);
      const activeIds = new Set(reminders.map(item => item.id));
      for (const [storedId, ids] of Object.entries(scheduleMap)) {
        if (!activeIds.has(storedId)) {
          await driver.cancelAlerts(ids);
          delete scheduleMap[storedId];
        }
      }
      const failedIds: string[] = [];
      for (const reminder of reminders) {
        const ok = await syncSingleInternal(reminder, allowSchedule, scheduleMap);
        if (!ok && allowSchedule && reminder.active) failedIds.push(reminder.id);
      }
      await writeScheduleMap(storage, scheduleMap).catch(() => undefined);
      return { failedIds };
    }),

    checkForegroundAlerts(reminders, now = new Date()) {
      if (driver.kind !== 'web' || !driver.notifyImmediate) return;
      const targetPre = new Date(now.getTime() + PRE_REMINDER_MINUTES * 60_000);
      for (const reminder of reminders) {
        const preKey = `${reminder.id}:${preOccurrenceKey(reminder, targetPre)}`;
        if (!emittedWebKeys.has(preKey) && isPreReminderDue(reminder, now)) {
          emittedWebKeys.add(preKey);
          const [preSpec] = buildReminderNotificationPayloads(reminder);
          driver.notifyImmediate(preSpec.title, preSpec.body);
        }
        const dueKey = `${reminder.id}:${occurrenceKey(reminder, now)}`;
        if (!emittedWebKeys.has(dueKey) && isDue(reminder, now)) {
          emittedWebKeys.add(dueKey);
          const [, dueSpec] = buildReminderNotificationPayloads(reminder);
          driver.notifyImmediate(dueSpec.title, dueSpec.body);
        }
      }
    },
  };
}
