import { expect, test } from '@jest/globals';

import { decodeReminders, encodeReminders, isDue, localDate, nextTriggerMs, occurrenceKey, validTime, type Reminder } from '../src/domain/reminders';

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
