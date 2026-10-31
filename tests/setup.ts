jest.mock('react-native-safe-area-context', () => jest.requireActual<{ default: unknown }>('react-native-safe-area-context/jest/mock').default);

const mockMemoryStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockMemoryStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => { mockMemoryStorage.set(key, value); }),
    removeItem: jest.fn(async (key: string) => { mockMemoryStorage.delete(key); }),
    clear: jest.fn(async () => { mockMemoryStorage.clear(); }),
  },
}));

let mockScheduledNotificationSeq = 0;

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
  },
  AndroidImportance: { HIGH: 4 },
  AndroidNotificationVisibility: { PRIVATE: 0 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ status: 'undetermined', granted: false, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true, canAskAgain: true })),
  scheduleNotificationAsync: jest.fn(async () => `notif-${++mockScheduledNotificationSeq}`),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
}));

beforeEach(() => {
  mockMemoryStorage.clear();
  mockScheduledNotificationSeq = 0;
});
