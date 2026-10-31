import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  STORAGE_KEY,
  decodeReminders,
  encodeReminders,
  isReminder,
  type Reminder,
} from '../../domain/reminders';
import type { ReminderRepository } from '../../services/contracts';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export class ReminderDataCorruptedError extends Error {
  constructor(message = 'Os dados salvos de lembretes estão em formato inválido e foram preservados sem alteração.') {
    super(message);
    this.name = 'ReminderDataCorruptedError';
  }
}

export class ReminderStorageError extends Error {
  constructor(message = 'Não foi possível acessar o armazenamento local neste aparelho.') {
    super(message);
    this.name = 'ReminderStorageError';
  }
}

let idSequence = 0;
export function generateReminderId(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (typeof randomUuid === 'string' && randomUuid.length > 0) return randomUuid;
  idSequence += 1;
  return `rem-${Date.now().toString(36)}-${idSequence.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readValidated(storage: KeyValueStorage, key: string): Promise<Reminder[]> {
  let raw: string | null;
  try {
    raw = await storage.getItem(key);
  } catch {
    throw new ReminderStorageError();
  }
  try {
    return decodeReminders(raw);
  } catch {
    throw new ReminderDataCorruptedError();
  }
}

/**
 * Local unencrypted app-private persistence backed by KeyValueStorage (AsyncStorage by default).
 * Serializes all write operations and refuses to overwrite corrupted documents.
 */
export function createLocalReminderRepository(
  storage: KeyValueStorage = AsyncStorage,
  storageKey = STORAGE_KEY,
): ReminderRepository {
  let queue: Promise<unknown> = Promise.resolve();

  const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
    const next = queue.then(operation, operation);
    queue = next.then(() => undefined, () => undefined);
    return next;
  };

  return {
    list: () => enqueue(() => readValidated(storage, storageKey)),

    save: (reminder: Reminder) => enqueue(async () => {
      if (!isReminder(reminder)) {
        throw new Error('Dados do lembrete inválidos');
      }
      const current = await readValidated(storage, storageKey);
      const index = current.findIndex(item => item.id === reminder.id);
      const updated = index >= 0
        ? current.map((item, idx) => (idx === index ? reminder : item))
        : [reminder, ...current];
      const payload = encodeReminders(updated);
      try {
        await storage.setItem(storageKey, payload);
      } catch {
        throw new ReminderStorageError('Não foi possível salvar o lembrete neste aparelho.');
      }
    }),

    remove: (id: string) => enqueue(async () => {
      const current = await readValidated(storage, storageKey);
      const updated = current.filter(item => item.id !== id);
      if (updated.length === current.length) return;
      const payload = encodeReminders(updated);
      try {
        await storage.setItem(storageKey, payload);
      } catch {
        throw new ReminderStorageError('Não foi possível remover o lembrete neste aparelho.');
      }
    }),
  };
}

export const defaultReminderRepository = createLocalReminderRepository();
