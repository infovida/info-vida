/** Calendar math uses civil days, independent of timezone offsets and DST. */
const DAY_MS = 86_400_000;
export function civilDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? Math.floor(date.getTime() / DAY_MS) : null;
}

export function activitySummary(dates: readonly string[], today: string) {
  const todayNumber = civilDay(today);
  if (todayNumber === null) throw new Error('Data local inválida');
  const days = [...new Set(dates.map(civilDay).filter((day): day is number => day !== null && day <= todayNumber))].sort((a, b) => a - b);
  const registered = new Set(days);
  let record = 0;
  let run = 0;
  let previous = -Infinity;
  for (const day of days) { run = day === previous + 1 ? run + 1 : 1; record = Math.max(record, run); previous = day; }
  let current = 0;
  let day = registered.has(todayNumber) ? todayNumber : todayNumber - 1;
  while (registered.has(day)) { current++; day--; }
  const sunday = todayNumber - ((todayNumber + 4) % 7 + 7) % 7;
  return { current, record, week: Array.from({ length: 7 }, (_, index) => {
    const number = sunday + index;
    return { date: new Date(number * DAY_MS).toISOString().slice(0, 10),
      completed: registered.has(number), today: number === todayNumber, future: number > todayNumber };
  }) };
}
