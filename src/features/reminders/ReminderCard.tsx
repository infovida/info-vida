import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { GradientSurface, SurfaceCard } from '../../components/layout';
import {
  WEEKDAYS,
  WEEKDAY_FULL_LABELS,
  WEEKDAY_SHORT_LABELS,
  formatTimeUntilNext,
  localDate,
  reminderAccentColors,
  type Reminder,
} from '../../domain/reminders';
import { colors, layout, radii, spacing, type } from '../../theme/tokens';

export function ReminderCard({
  reminder,
  now,
  busy = false,
  scheduleWarning = false,
  onToggleTaken,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  reminder: Reminder;
  now: Date;
  busy?: boolean;
  scheduleWarning?: boolean;
  onToggleTaken: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stackActions = width < 360 || fontScale >= 1.35;
  const today = localDate(now);
  const takenToday = reminder.takenDate === today;
  const showTakenButton = reminder.active || takenToday;
  const accent = reminderAccentColors(reminder.id);
  const countdownText = formatTimeUntilNext(reminder, now);

  const actions = (
    <View style={stackActions ? styles.actionsRow : styles.actionsColumn}>
      {showTakenButton && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            takenToday
              ? `Desfazer tomada de hoje de ${reminder.name}`
              : `Marcar ${reminder.name} como tomado hoje`
          }
          accessibilityState={{ disabled: busy, selected: takenToday }}
          disabled={busy}
          onPress={onToggleTaken}
          style={({ pressed }) => [
            styles.circleButton,
            takenToday ? styles.takenButtonActive : styles.takenButton,
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          <AppIcon name="checkCircle" color={colors.success} size={22} active={takenToday} />
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          reminder.active
            ? `Pausar lembrete ${reminder.name}`
            : `Ativar lembrete ${reminder.name}`
        }
        accessibilityState={{ disabled: busy, selected: reminder.active }}
        disabled={busy}
        onPress={onToggleActive}
        style={({ pressed }) => [
          styles.circleButton,
          reminder.active ? styles.bellActiveButton : styles.bellPausedButton,
          pressed && styles.pressed,
          busy && styles.disabled,
        ]}
      >
        <AppIcon
          name={reminder.active ? 'reminders' : 'bellOff'}
          color={reminder.active ? colors.primary : colors.muted}
          size={20}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Editar lembrete ${reminder.name}`}
        accessibilityState={{ disabled: busy }}
        disabled={busy}
        onPress={onEdit}
        style={({ pressed }) => [
          styles.circleButton,
          styles.editButton,
          pressed && styles.pressed,
          busy && styles.disabled,
        ]}
      >
        <AppIcon name="edit" color={colors.body} size={19} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remover lembrete ${reminder.name}`}
        accessibilityState={{ disabled: busy }}
        disabled={busy}
        onPress={onDelete}
        style={({ pressed }) => [
          styles.circleButton,
          styles.deleteButton,
          pressed && styles.pressed,
          busy && styles.disabled,
        ]}
      >
        <AppIcon name="trash" color={colors.danger} size={20} />
      </Pressable>
    </View>
  );

  return (
    <SurfaceCard style={[styles.card, takenToday && styles.cardTaken]}>
      <View style={styles.mainRow}>
        <GradientSurface gradientColors={accent} style={styles.pillBox}>
          <AppIcon name="pill" color={colors.surface} size={24} />
        </GradientSurface>

        <View style={styles.center}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{reminder.name}</Text>
            {reminder.active && <View accessible={false} style={styles.activeDot} />}
          </View>

          <Text style={styles.dose}>
            {reminder.dose.trim().length > 0 ? reminder.dose : 'Sem dosagem informada'}
          </Text>

          <View style={styles.timeRow}>
            <View style={styles.timePill}>
              <AppIcon name="clock" color={colors.primary} size={14} active />
              <Text style={styles.timeText}>{reminder.time}</Text>
            </View>

            {takenToday ? (
              <View style={styles.takenBadge}>
                <AppIcon name="check" color={colors.success} size={14} active />
                <Text style={styles.takenBadgeText}>Tomado hoje</Text>
              </View>
            ) : (
              <View style={styles.countdownRow}>
                <AppIcon name="alarm" color={colors.muted} size={14} />
                <Text style={styles.countdownText}>{countdownText}</Text>
              </View>
            )}
          </View>

          <View
            accessible
            accessibilityLabel={`Dias agendados: ${reminder.days.map(day => WEEKDAY_FULL_LABELS[day]).join(', ')}`}
            style={styles.daysRow}
          >
            {WEEKDAYS.map(day => {
              const selected = reminder.days.includes(day);
              return (
                <View
                  key={day}
                  style={[styles.dayBadge, selected ? styles.dayBadgeSelected : styles.dayBadgeUnselected]}
                >
                  <Text style={[styles.dayText, selected ? styles.dayTextSelected : styles.dayTextUnselected]}>
                    {WEEKDAY_SHORT_LABELS[day]}
                  </Text>
                </View>
              );
            })}
          </View>

          {reminder.notes && reminder.notes.trim().length > 0 && (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{reminder.notes}</Text>
            </View>
          )}

          {scheduleWarning && reminder.active && (
            <Text style={styles.scheduleWarning}>
              Salvo neste aparelho; aviso não agendado.
            </Text>
          )}
        </View>

        {!stackActions && actions}
      </View>

      {stackActions && actions}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTaken: {
    borderColor: '#86EFAC',
    borderWidth: 1.5,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pillBox: {
    width: 52,
    height: 52,
    borderRadius: radii.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  name: {
    ...type.subtitle,
    fontWeight: '700',
    color: colors.title,
    flexShrink: 1,
  },
  activeDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: '#10B981',
  },
  dose: {
    ...type.small,
    color: colors.muted,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 2,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  timeText: {
    ...type.caption,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdownText: {
    ...type.caption,
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
  },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  takenBadgeText: {
    ...type.caption,
    fontSize: 13,
    color: colors.success,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  dayBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 99,
  },
  dayBadgeSelected: {
    backgroundColor: colors.primary,
  },
  dayBadgeUnselected: {
    backgroundColor: '#F1F5F9',
  },
  dayText: {
    fontSize: 12,
    lineHeight: 16,
  },
  dayTextSelected: {
    color: colors.surface,
    fontWeight: '700',
  },
  dayTextUnselected: {
    color: '#475569',
    fontWeight: '600',
  },
  notesBox: {
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.icon,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesText: {
    ...type.caption,
    color: colors.body,
  },
  scheduleWarning: {
    ...type.caption,
    color: colors.warning,
    fontWeight: '600',
    marginTop: 2,
  },
  actionsColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  circleButton: {
    minWidth: layout.minTouch,
    minHeight: layout.minTouch,
    width: layout.minTouch,
    height: layout.minTouch,
    borderRadius: layout.minTouch / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  takenButton: {
    backgroundColor: colors.successSoft,
    borderColor: '#86EFAC',
  },
  takenButtonActive: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.success,
    borderWidth: 2,
  },
  bellActiveButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  bellPausedButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  editButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#FECACA',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.55,
  },
});
