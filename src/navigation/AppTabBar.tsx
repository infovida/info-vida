import type { ComponentRef, Ref } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme/tokens';

/** One visual container shared by the tab navigator and the quiz stack screens. */
export function AppTabBar({ ref, style, ...props }: ViewProps & { ref?: Ref<ComponentRef<typeof View>> }) {
  const insets = useSafeAreaInsets();
  return <View ref={ref} {...props} style={[styles.bar, {
    paddingBottom: Math.max(insets.bottom, spacing.sm), paddingLeft: Math.max(insets.left, spacing.xs),
    paddingRight: Math.max(insets.right, spacing.xs),
  }, style]} />;
}
const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border,
    paddingTop: spacing.sm, gap: 2 },
});
