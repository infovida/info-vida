import { describe, expect, it } from '@jest/globals';

import { activitySummary, civilDay } from '../src/domain/activity';

describe('atividade em datas civis', () => {
  it('valida datas reais e não aceita futuro, duplicação ou dados inválidos como atividade', () => {
    expect(civilDay('2026-02-31')).toBeNull();
    expect(civilDay('ontem')).toBeNull();
    expect(civilDay('2024-02-29')).not.toBeNull();
    expect(() => activitySummary([], 'inválida')).toThrow('Data local inválida');
    const summary = activitySummary(['2026-10-25', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-30', 'inválida'], '2026-10-27');
    expect(summary.current).toBe(3);
    expect(summary.record).toBe(3);
    expect(summary.week.filter(day => day.completed)).toHaveLength(3);
    expect(summary.week.find(day => day.today)?.date).toBe('2026-10-27');
    expect(summary.week.find(day => day.date === '2026-10-30')).toMatchObject({ future: true, completed: false });
  });
  it('mantém sequência até ontem e zera atual após lacuna sem apagar recorde', () => {
    const dates = ['2026-10-24', '2026-10-25', '2026-10-26'];
    expect(activitySummary(dates, '2026-10-27')).toMatchObject({ current: 3, record: 3 });
    expect(activitySummary(dates, '2026-10-28')).toMatchObject({ current: 0, record: 3 });
    expect(activitySummary([], '2026-10-27')).toMatchObject({ current: 0, record: 0 });
  });
  it('atravessa mês, ano e horário de verão por datas e conserva lacunas no calendário', () => {
    expect(activitySummary(['2025-12-31', '2026-01-01'], '2026-01-01').current).toBe(2);
    expect(activitySummary(['2026-03-07', '2026-03-08', '2026-03-09'], '2026-03-09').current).toBe(3);
    const summary = activitySummary(['2026-10-25', '2026-10-27'], '2026-10-27');
    expect(summary.current).toBe(1);
    expect(summary.week[1]).toMatchObject({ date: '2026-10-26', completed: false });
  });
});
