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

export const PRE_REMINDER_MINUTES = 30;
export const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;
export const WEEKDAY_SHORT_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export const WEEKDAY_FULL_LABELS = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
] as const;
export const DAY_PRESETS = {
  all: [0, 1, 2, 3, 4, 5, 6],
  weekdays: [1, 2, 3, 4, 5],
  weekend: [0, 6],
} as const;

export const REMINDER_CARD_ACCENTS = [
  ['#2585E8', '#1565C0'],
  ['#26C6DA', '#0097A7'],
  ['#8B5CF6', '#6D28D9'],
  ['#26A69A', '#00796B'],
] as const;

export function reminderAccentColors(id: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return REMINDER_CARD_ACCENTS[hash % REMINDER_CARD_ACCENTS.length];
}

export interface ReminderStats {
  total: number;
  active: number;
  takenToday: number;
}

export function computeReminderStats(reminders: readonly Reminder[], now = new Date()): ReminderStats {
  const today = localDate(now);
  let active = 0;
  let takenToday = 0;
  for (const item of reminders) {
    if (item.active) active += 1;
    if (item.takenDate === today) takenToday += 1;
  }
  return { total: reminders.length, active, takenToday };
}

export function formatTimeUntilNext(reminder: Reminder, now = new Date()): string {
  if (!reminder.active) return 'Pausado';
  const diffMs = nextTriggerMs(reminder.time, reminder.days, now) - now.getTime();
  const totalMinutes = Math.max(1, Math.ceil(diffMs / 60_000));
  if (totalMinutes >= 1440) {
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    return hours > 0 ? `em ${days}d ${hours}h` : `em ${days}d`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `em ${hours}h ${minutes}min`;
  if (hours > 0) return `em ${hours}h`;
  return `em ${minutes}min`;
}

export interface ShiftedSchedule {
  hour: number;
  minute: number;
  time: string;
  days: number[];
}

export function computeShiftedSchedule(time: string, days: readonly number[], advanceMinutes: number): ShiftedSchedule {
  if (!validTime(time) || !days.length || days.some(day => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new Error('Horário ou dias inválidos');
  }
  const [hours, minutes] = time.split(':').map(Number);
  const shifted = hours * 60 + minutes - advanceMinutes;
  const dayShift = Math.floor(shifted / 1440);
  const wrapped = ((shifted % 1440) + 1440) % 1440;
  const hour = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  const shiftedDays = Array.from(new Set(days.map(day => ((day + dayShift) % 7 + 7) % 7))).sort((a, b) => a - b);
  return {
    hour,
    minute,
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    days: shiftedDays,
  };
}

export function preOccurrenceKey(reminder: Reminder, targetTime: Date, advanceMinutes = PRE_REMINDER_MINUTES): string {
  return `${localDate(targetTime)}T${reminder.time}-pre${advanceMinutes}`;
}

export function isPreReminderDue(
  reminder: Reminder,
  now = new Date(),
  lastPreKey?: string,
  advanceMinutes = PRE_REMINDER_MINUTES,
): boolean {
  if (!reminder.active) return false;
  const target = new Date(now.getTime() + advanceMinutes * 60_000);
  const targetClock = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;
  return reminder.days.includes(target.getDay())
    && reminder.time === targetClock
    && reminder.takenDate !== localDate(target)
    && lastPreKey !== preOccurrenceKey(reminder, target, advanceMinutes);
}

export function adjustTimeByMinutes(time: string, deltaMinutes: number): string {
  const base = validTime(time) ? time : '08:00';
  const [hours, minutes] = base.split(':').map(Number);
  const wrapped = (((hours * 60 + minutes + deltaMinutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

export interface ReminderDraft {
  id: string;
  name: string;
  dose: string;
  time: string;
  days: readonly number[];
  notes: string;
  active: boolean;
}

export interface ReminderFieldErrors {
  name?: string;
  dose?: string;
  time?: string;
  days?: string;
  notes?: string;
}

export type ReminderValidationResult =
  | { ok: true; reminder: Reminder }
  | { ok: false; errors: ReminderFieldErrors; firstField: keyof ReminderFieldErrors };

export function validateReminderDraft(draft: ReminderDraft, existing?: Reminder): ReminderValidationResult {
  const errors: ReminderFieldErrors = {};
  const name = draft.name.trim();
  const dose = draft.dose.trim();
  const time = draft.time.trim();
  const notes = draft.notes.trim();
  const days = Array.from(new Set(draft.days.filter(day => Number.isInteger(day) && day >= 0 && day <= 6))).sort((a, b) => a - b);

  if (!name) errors.name = 'Informe o nome do lembrete';
  else if (name.length > 120) errors.name = 'O nome deve ter no máximo 120 caracteres';

  if (dose.length > 160) errors.dose = 'A dosagem deve ter no máximo 160 caracteres';
  if (!validTime(time)) errors.time = 'Informe um horário válido';
  if (!days.length) errors.days = 'Selecione ao menos um dia da semana';
  if (notes.length > 500) errors.notes = 'As observações devem ter no máximo 500 caracteres';

  const order: (keyof ReminderFieldErrors)[] = ['name', 'dose', 'time', 'days', 'notes'];
  const firstField = order.find(field => errors[field] !== undefined);
  if (firstField) return { ok: false, errors, firstField };

  const reminder: Reminder = {
    id: existing?.id ?? draft.id,
    name,
    dose,
    time,
    days,
    active: draft.active,
    ...(notes ? { notes } : {}),
    ...(existing?.takenDate ? { takenDate: existing.takenDate } : {}),
    ...(existing?.notifiedAt ? { notifiedAt: existing.notifiedAt } : {}),
  };
  if (!isReminder(reminder)) {
    return { ok: false, errors: { name: 'Informe o nome do lembrete' }, firstField: 'name' };
  }
  return { ok: true, reminder };
}

export const WATER_REMINDER_PRESET = {
  name: 'Água 💧',
  dose: '1 a 2 copos de água',
  time: '08:00',
  days: [0, 1, 2, 3, 4, 5, 6],
  active: true,
  notes: 'Beber pelo menos 2 litros de água por dia',
} as const;

