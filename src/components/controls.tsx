import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radii, spacing, type } from '../theme/tokens';
import { AppIcon, type IconName } from './AppIcon';
import { GradientSurface } from './layout';

export function GradientButton({ label, onPress, loading = false, disabled = false, variant = 'primary', icon, size = 'default', gradientColors }: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger'; icon?: IconName; size?: 'default' | 'large'; gradientColors?: readonly string[];
}) {
  const [focused, setFocused] = useState(false);
  const blocked = loading || disabled;
  const foreground = variant === 'secondary' ? colors.primary : colors.surface;
  const content: ReactNode = <View style={styles.buttonContent}>
    {loading ? <ActivityIndicator color={foreground} accessibilityLabel="Aguarde" /> : icon && <AppIcon name={icon} color={foreground} size={20} />}
    <Text style={[styles.buttonText, size === 'large' && { fontSize: 18, lineHeight: 26, fontWeight: '700' }, { color: foreground }]}>{loading ? 'Aguarde…' : label}</Text>
  </View>;
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ disabled: blocked, busy: loading }} disabled={blocked} onPress={onPress}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.button, { opacity: blocked ? 0.6 : pressed ? 0.85 : 1 }, focused && styles.focus]}>
    {variant === 'primary' ? <GradientSurface tone="action" readable gradientColors={gradientColors} style={styles.buttonShape}>{content}</GradientSurface>
      : <View style={[styles.buttonShape, variant === 'danger' ? styles.danger : styles.secondary]}>{content}</View>}
  </Pressable>;
}

export function IconButton({ label, icon, onPress, disabled = false }: {
  label: string; icon: IconName; onPress: () => void; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed, focused && styles.focus]}>
    <AppIcon name={icon} color={disabled ? colors.muted : colors.primary} />
  </Pressable>;
}

export function CategoryChip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: IconName }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed, focused && styles.focus]}>
    <GradientSurface tone="action" readable style={[StyleSheet.absoluteFill, { borderRadius: 99, overflow: 'hidden', opacity: selected ? 1 : 0 }]} />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
    {icon && <AppIcon name={icon} size={16} color={selected ? colors.surface : colors.muted} />}
    <Text style={[type.small, { color: selected ? colors.surface : colors.body, fontWeight: '600' }]}>{label}</Text>
    </View>
  </Pressable>;
}

export function ProgressBar({ value, label, light = false }: { value: number; label: string; light?: boolean }) {
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label}
    accessibilityValue={{ min: 0, max: 100, now: percent }} style={[styles.track, light && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
    {light ? <View style={{ height: '100%', width: `${percent}%`, backgroundColor: colors.surface, borderRadius: radii.icon }} /> : <GradientSurface tone="education" style={{ height: '100%', width: `${percent}%`, borderRadius: radii.icon }} />}
  </View>;
}
const styles = StyleSheet.create({
  button: { minHeight: 56, borderRadius: radii.button }, buttonShape: { borderRadius: radii.button, overflow: 'hidden' },
  buttonContent: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  buttonText: { ...type.label, textAlign: 'center', flexShrink: 1 },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
  danger: { backgroundColor: colors.dangerText }, focus: { outlineColor: colors.focus, outlineWidth: 2, outlineOffset: 2 },
  iconButton: { minHeight: layout.minTouch, minWidth: layout.minTouch, alignItems: 'center', justifyContent: 'center', borderRadius: radii.icon },
  chip: { minHeight: layout.minTouch, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, justifyContent: 'center',
    borderRadius: 99, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.surface },
  selectedChip: { backgroundColor: colors.primary }, pressed: { opacity: 0.7 },
  track: { height: 10, borderRadius: radii.icon, backgroundColor: colors.softBlue, overflow: 'hidden' },
});
