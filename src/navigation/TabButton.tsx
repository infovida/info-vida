import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { AppIcon, type IconName } from '../components/AppIcon';
import { colors, layout, radii, spacing, type } from '../theme/tokens';

export function TabButton({ label, icon, isFocused = false, ref, ...props }: Omit<PressableProps, 'children' | 'style'> & {
  label: string; icon: IconName; isFocused?: boolean; ref?: Ref<ComponentRef<typeof View>>;
}) {
  const [focused, setFocused] = useState(false);
  const foreground = icon === 'emergency' ? colors.dangerText : isFocused ? colors.primary : colors.muted;
  return <Pressable {...props} ref={ref} accessibilityRole="tab" accessibilityLabel={label}
    accessibilityState={{ selected: isFocused }} onFocus={event => { setFocused(true); props.onFocus?.(event); }}
    onBlur={event => { setFocused(false); props.onBlur?.(event); }} style={({ pressed }) => [styles.tab, isFocused && styles.active,
      pressed && { opacity: 0.7 }, focused && { outlineWidth: 2, outlineColor: colors.primary }]}>
    <AppIcon name={icon} color={foreground} active={isFocused} />
    <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    {isFocused && <View style={[styles.indicator, { backgroundColor: foreground }]} />}
  </Pressable>;
}
const styles = StyleSheet.create({
  tab: { flex: 1, minHeight: layout.minTouch, borderRadius: radii.field, paddingVertical: spacing.sm,
    paddingHorizontal: 2, gap: spacing.xs, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  active: { backgroundColor: colors.activeTab, borderColor: 'rgba(21,101,192,0.2)' },
  label: { ...type.caption, fontWeight: '600', textAlign: 'center' }, indicator: { width: 4, height: 4, borderRadius: 2 },
});
