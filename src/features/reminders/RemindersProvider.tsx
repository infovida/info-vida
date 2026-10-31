import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';

import { localDate, type Reminder } from '../../domain/reminders';
import type { ReminderRepository } from '../../services/contracts';
import {
  ReminderDataCorruptedError,
  defaultReminderRepository,
  generateReminderId,
} from './localReminderRepository';
import {
  createReminderNotificationService,
  type NotificationPermissionState,
  type ReminderNotificationService,
} from './reminderNotifications';

export type RemindersLoadStatus = 'idle' | 'loading' | 'ready' | 'error' | 'corrupted';

export interface RemindersContextValue {
  status: RemindersLoadStatus;
  reminders: readonly Reminder[];
  now: Date;
  permission: NotificationPermissionState;
  notificationsEnabled: boolean;
  permissionBusy: boolean;
  unscheduledIds: readonly string[];
  busyIds: readonly string[];
  toastMessage: string | null;
  actionError: string | null;
  ensureLoaded: () => Promise<void>;
  reload: () => Promise<void>;
  refreshClock: () => void;
  createId: () => string;
  dismissToast: () => void;
  clearActionError: () => void;
  activateNotifications: () => Promise<void>;
  deactivateNotifications: () => Promise<void>;
  openNotificationSettings: () => Promise<void>;
  retrySchedules: () => Promise<void>;
  saveReminder: (reminder: Reminder, mode: 'create' | 'edit') => Promise<void>;
  toggleTakenToday: (id: string) => Promise<void>;
  toggleReminderActive: (id: string) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);
const defaultGetNow = () => new Date();

function isSameMinute(a: Date, b: Date): boolean {
  return Math.floor(a.getTime() / 60_000) === Math.floor(b.getTime() / 60_000);
}

export function RemindersProvider({
  children,
  repository = defaultReminderRepository,
  notificationService,
  getNow = defaultGetNow,
  createId = generateReminderId,
}: PropsWithChildren<{
  repository?: ReminderRepository;
  notificationService?: ReminderNotificationService;
  getNow?: () => Date;
  createId?: () => string;
}>) {
  const [status, setStatus] = useState<RemindersLoadStatus>('idle');
  const [reminders, setReminders] = useState<readonly Reminder[]>([]);
  const remindersRef = useRef<readonly Reminder[]>([]);

  const [defaultService] = useState(() => createReminderNotificationService());
  const notifications = notificationService ?? defaultService;

  const [now, setNow] = useState<Date>(() => getNow());
  const [permission, setPermission] = useState<NotificationPermissionState>('undetermined');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionBusy, setPermissionBusy] = useState(false);
  const [unscheduledIds, setUnscheduledIds] = useState<readonly string[]>([]);
  const [busyIds, setBusyIds] = useState<readonly string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const busySetRef = useRef<Set<string>>(new Set());
  const activeFeatureRef = useRef(false);

  const setItemBusy = useCallback((id: string, busy: boolean) => {
    if (busy) busySetRef.current.add(id);
    else busySetRef.current.delete(id);
    setBusyIds(Array.from(busySetRef.current));
  }, []);

  const refreshClock = useCallback(() => {
    const current = getNow();
    setNow(prev => (isSameMinute(prev, current) ? prev : current));
    if (permission === 'granted' && notificationsEnabled && remindersRef.current.length > 0) {
      notifications.checkForegroundAlerts(remindersRef.current, current);
    }
  }, [getNow, notifications, notificationsEnabled, permission]);

  const loadData = useCallback(async () => {
    activeFeatureRef.current = true;
    setStatus('loading');
    setActionError(null);
    try {
      const [items, perm, enabledPref] = await Promise.all([
        repository.list(),
        notifications.getPermission(),
        notifications.isEnabled(),
      ]);
      const allowSchedule = perm === 'granted' && enabledPref;
      remindersRef.current = items;
      setReminders(items);
      setPermission(perm);
      setNotificationsEnabled(allowSchedule);
      setNow(getNow());
      setStatus('ready');
      const syncResult = await notifications.syncAll(items, allowSchedule);
      setUnscheduledIds(syncResult.failedIds);
    } catch (error) {
      if (error instanceof ReminderDataCorruptedError) {
        setStatus('corrupted');
      } else {
        setStatus('error');
      }
    }
  }, [getNow, notifications, repository]);

  const reload = useCallback(async () => {
    const task = loadData();
    loadPromiseRef.current = task;
    await task;
  }, [loadData]);

  const ensureLoaded = useCallback(async () => {
    if (status === 'ready' || status === 'corrupted') {
      refreshClock();
      return;
    }
    if (loadPromiseRef.current) {
      await loadPromiseRef.current;
      return;
    }
    await reload();
  }, [refreshClock, reload, status]);

  useEffect(() => {
    if (status !== 'ready') return;
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && activeFeatureRef.current) {
        setNow(getNow());
        void Promise.all([notifications.getPermission(), notifications.isEnabled()]).then(([perm, enabledPref]) => {
          const allow = perm === 'granted' && enabledPref;
          setPermission(perm);
          setNotificationsEnabled(allow);
          return notifications.syncAll(remindersRef.current, allow);
        }).then(res => setUnscheduledIds(res.failedIds)).catch(() => undefined);
      }
    });
    const timer = setInterval(() => {
      const current = getNow();
      setNow(current);
      if (permission === 'granted' && notificationsEnabled && remindersRef.current.length > 0) {
        notifications.checkForegroundAlerts(remindersRef.current, current);
      }
    }, 30_000);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [getNow, notifications, notificationsEnabled, permission, status]);

  const activateNotifications = useCallback(async () => {
    if (permissionBusy) return;
    setPermissionBusy(true);
    setActionError(null);
    try {
      const perm = await notifications.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        await notifications.setEnabled(true).catch(() => undefined);
        setNotificationsEnabled(true);
        const syncResult = await notifications.syncAll(remindersRef.current, true);
        setUnscheduledIds(syncResult.failedIds);
        if (syncResult.failedIds.length > 0) {
          setActionError('Salvo neste aparelho; alguns avisos não puderam ser agendados.');
        } else {
          setToastMessage('Notificações ativadas (30 min antes e no horário).');
        }
      } else {
        setNotificationsEnabled(false);
      }
    } finally {
      setPermissionBusy(false);
    }
  }, [notifications, permissionBusy]);

  const deactivateNotifications = useCallback(async () => {
    if (permissionBusy) return;
    setPermissionBusy(true);
    setActionError(null);
    try {
      await notifications.setEnabled(false).catch(() => undefined);
      setNotificationsEnabled(false);
      await notifications.syncAll(remindersRef.current, false);
      setUnscheduledIds([]);
      setToastMessage('Notificações pausadas neste aparelho.');
    } finally {
      setPermissionBusy(false);
    }
  }, [notifications, permissionBusy]);

  const openNotificationSettings = useCallback(async () => {
    const opened = await notifications.openSettings();
    if (!opened) {
      setActionError('Abra as configurações do sistema neste aparelho para liberar as notificações do InfoVida.');
    }
  }, [notifications]);

  const retrySchedules = useCallback(async () => {
    const allow = permission === 'granted' && notificationsEnabled;
    if (!allow) return;
    setActionError(null);
    const syncResult = await notifications.syncAll(remindersRef.current, true);
    setUnscheduledIds(syncResult.failedIds);
    if (syncResult.failedIds.length === 0) {
      setToastMessage('Avisos reagendados com sucesso.');
    } else {
      setActionError('Salvo neste aparelho; aviso não agendado.');
    }
  }, [notifications, notificationsEnabled, permission]);

  const saveReminder = useCallback(async (reminder: Reminder, mode: 'create' | 'edit') => {
    setActionError(null);
    await repository.save(reminder);
    const nextList = (() => {
      const current = remindersRef.current;
      const idx = current.findIndex(item => item.id === reminder.id);
      return idx >= 0
        ? current.map((item, i) => (i === idx ? reminder : item))
        : [reminder, ...current];
    })();
    remindersRef.current = nextList;
    setReminders(nextList);
    setNow(getNow());

    const allow = permission === 'granted' && notificationsEnabled;
    const { scheduled } = await notifications.syncReminder(reminder, allow);
    setUnscheduledIds(prev => {
      const filtered = prev.filter(id => id !== reminder.id);
      return allow && reminder.active && !scheduled ? [...filtered, reminder.id] : filtered;
    });
  }, [getNow, notifications, notificationsEnabled, permission, repository]);

  const toggleTakenToday = useCallback(async (id: string) => {
    if (busySetRef.current.has(id)) return;
    const target = remindersRef.current.find(item => item.id === id);
    if (!target) return;
    const today = localDate(getNow());
    const alreadyTaken = target.takenDate === today;
    if (!alreadyTaken && !target.active) return;

    const updated: Reminder = {
      ...target,
      ...(alreadyTaken ? { takenDate: undefined } : { takenDate: today }),
    };
    if (alreadyTaken) delete updated.takenDate;

    setItemBusy(id, true);
    setActionError(null);
    try {
      await repository.save(updated);
      const nextList = remindersRef.current.map(item => (item.id === id ? updated : item));
      remindersRef.current = nextList;
      setReminders(nextList);
      setNow(getNow());
    } catch {
      setActionError('Não foi possível salvar a marcação de hoje. Seus dados anteriores foram mantidos.');
    } finally {
      setItemBusy(id, false);
    }
  }, [getNow, repository, setItemBusy]);

  const toggleReminderActive = useCallback(async (id: string) => {
    if (busySetRef.current.has(id)) return;
    const target = remindersRef.current.find(item => item.id === id);
    if (!target) return;
    const updated: Reminder = { ...target, active: !target.active };

    setItemBusy(id, true);
    setActionError(null);
    try {
      await repository.save(updated);
      const nextList = remindersRef.current.map(item => (item.id === id ? updated : item));
      remindersRef.current = nextList;
      setReminders(nextList);
      setNow(getNow());

      const allow = permission === 'granted' && notificationsEnabled;
      const { scheduled } = await notifications.syncReminder(updated, allow);
      setUnscheduledIds(prev => {
        const filtered = prev.filter(item => item !== id);
        return allow && updated.active && !scheduled ? [...filtered, id] : filtered;
      });
    } catch {
      setActionError('Não foi possível atualizar o estado do lembrete. Tente novamente.');
    } finally {
      setItemBusy(id, false);
    }
  }, [getNow, notifications, notificationsEnabled, permission, repository, setItemBusy]);

  const removeReminder = useCallback(async (id: string) => {
    setItemBusy(id, true);
    setActionError(null);
    try {
      await repository.remove(id);
      await notifications.cancelReminder(id);
      const nextList = remindersRef.current.filter(item => item.id !== id);
      remindersRef.current = nextList;
      setReminders(nextList);
      setUnscheduledIds(prev => prev.filter(item => item !== id));
      setNow(getNow());
    } finally {
      setItemBusy(id, false);
    }
  }, [getNow, notifications, repository, setItemBusy]);

  const value = useMemo<RemindersContextValue>(() => ({
    status,
    reminders,
    now,
    permission,
    notificationsEnabled,
    permissionBusy,
    unscheduledIds,
    busyIds,
    toastMessage,
    actionError,
    ensureLoaded,
    reload,
    refreshClock,
    createId,
    dismissToast: () => setToastMessage(null),
    clearActionError: () => setActionError(null),
    activateNotifications,
    deactivateNotifications,
    openNotificationSettings,
    retrySchedules,
    saveReminder,
    toggleTakenToday,
    toggleReminderActive,
    removeReminder,
  }), [
    actionError,
    activateNotifications,
    busyIds,
    createId,
    deactivateNotifications,
    ensureLoaded,
    notificationsEnabled,
    now,
    openNotificationSettings,
    permission,
    permissionBusy,
    refreshClock,
    reload,
    reminders,
    removeReminder,
    retrySchedules,
    saveReminder,
    status,
    toastMessage,
    toggleReminderActive,
    toggleTakenToday,
    unscheduledIds,
  ]);

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersContextValue {
  const context = useContext(RemindersContext);
  if (!context) throw new Error('RemindersProvider ausente');
  return context;
}
