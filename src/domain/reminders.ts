// Adaptado do protótipo Figma Make. Sem APIs de navegador ou geração de ID.
export interface Reminder {
  id: string;
  name: string;
  time: string;
  days: number[];
  dose: string;
  active: boolean;
  notes?: string;
  takenDate?: string;
  notifiedAt?: string;
}

export const STORAGE_KEY = 'infovida.reminders.v1';
export const validTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function nextTriggerMs(time: string, days: number[], now = new Date()): number {
  if (!validTime(time) || !days.length || days.some(day => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new Error('Horário ou dias inválidos');
  }
  const [hours, minutes] = time.split(':').map(Number);
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(hours, minutes, 0, 0);
    if (days.includes(candidate.getDay()) && candidate.getTime() > now.getTime()) return candidate.getTime();
  }
  throw new Error('Não foi possível calcular o próximo horário');
}

export function occurrenceKey(reminder: Reminder, now = new Date()): string {
  return `${localDate(now)}T${reminder.time}`;
}

// Only the current minute is eligible: never replay old medication alerts after resuming a suspended tab.
export function isDue(reminder: Reminder, now = new Date()): boolean {
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return reminder.active && reminder.days.includes(now.getDay()) && reminder.time === time
    && reminder.takenDate !== localDate(now) && reminder.notifiedAt !== occurrenceKey(reminder, now);
}

export function isReminder(value: unknown): value is Reminder {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return typeof r.id === 'string' && r.id.length > 0
    && typeof r.name === 'string' && r.name.trim().length > 0 && r.name.length <= 120
    && typeof r.time === 'string' && validTime(r.time)
    && Array.isArray(r.days) && r.days.length > 0 && r.days.length <= 7
    && r.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6)
    && new Set(r.days).size === r.days.length
    && typeof r.dose === 'string' && r.dose.length <= 160
    && typeof r.active === 'boolean'
    && (r.notes === undefined || typeof r.notes === 'string' && r.notes.length <= 500)
    && (r.takenDate === undefined || typeof r.takenDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.takenDate))
    && (r.notifiedAt === undefined || typeof r.notifiedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(r.notifiedAt));
}

export function decodeReminders(raw: string | null): Reminder[] {
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (data?.version !== 1 || !Array.isArray(data.reminders) || !data.reminders.every(isReminder)
    || new Set(data.reminders.map((r: Reminder) => r.id)).size !== data.reminders.length) {
    throw new Error('Dados de lembretes inválidos');
  }
  return data.reminders;
}

export function encodeReminders(reminders: Reminder[]): string {
  const raw = JSON.stringify({ version: 1, reminders });
  decodeReminders(raw);
  return raw;
}
