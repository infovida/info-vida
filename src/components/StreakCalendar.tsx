import { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';

import { activitySummary } from '../domain/activity';
import { localDate } from '../domain/reminders';
import { colors, radii, spacing, type } from '../theme/tokens';
import { AppIcon } from './AppIcon';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
function useLocalDate() {
  const [today, setToday] = useState(() => localDate());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      setToday(localDate());
      const next = new Date();
      next.setHours(24, 0, 0, 0);
      timer = setTimeout(refresh, next.getTime() - Date.now() + 50);
    };
    refresh();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, []);
  return today;
}
export function StreakCalendar({ dates, compact = false, today: suppliedToday }: {
  dates: readonly string[]; compact?: boolean; today?: string;
}) {
  const clockToday = useLocalDate();
  const summary = activitySummary(dates, suppliedToday ?? clockToday);
  return <View style={styles.container}>
    <View style={styles.heading}>
      <AppIcon name="flame" color={colors.orange} size={compact ? 20 : 28} />
      <Text style={[type.label, { color: colors.orange }]}>{summary.current} {summary.current === 1 ? 'dia seguido' : 'dias seguidos'}</Text>
    </View>
    {!compact && <>
      <Text style={[type.small, { color: colors.body }]}>Recorde: {summary.record} {summary.record === 1 ? 'dia' : 'dias'}</Text>
      <View style={styles.week}>
        {summary.week.map((day, index) => <View key={day.date} accessible
          accessibilityLabel={`${DAYS[index]}, ${day.date}: ${day.future ? 'dia futuro' : day.completed ? 'atividade concluída' : 'sem atividade'}${day.today ? ', hoje' : ''}`}
          style={[styles.day, day.completed && styles.done, day.today && styles.today]}>
          <Text style={[type.caption, { color: day.completed ? colors.surface : colors.body }]}>{DAYS[index].slice(0, 3)}</Text>
          <AppIcon size={16} name={day.completed ? 'check' : day.today ? 'info' : 'close'} color={day.completed ? colors.surface : colors.muted} />
        </View>)}
      </View>
      <Text style={[type.caption, { color: colors.muted }]}>Cada dia com um quiz concluído conta uma vez.</Text>
    </>}
  </View>;
}
const styles = StyleSheet.create({
  container: { borderRadius: radii.field, backgroundColor: colors.orangeSoft, padding: spacing.lg, gap: spacing.sm },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  week: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  day: { minWidth: 48, flexGrow: 1, padding: spacing.sm, borderRadius: radii.icon, gap: spacing.xs,
    borderWidth: 1, borderColor: 'transparent', alignItems: 'center' },
  done: { backgroundColor: colors.primary }, today: { borderColor: colors.orange },
});
