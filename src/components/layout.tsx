import type { PropsWithChildren, ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cardShadow, colors, gradients, layout, radii, spacing, type, type GradientName } from '../theme/tokens';
import { AppIcon, type IconName } from './AppIcon';

export function GradientSurface({ children, tone = 'brand', readable = false, style, gradientColors }: PropsWithChildren<{
  tone?: GradientName; readable?: boolean; style?: StyleProp<ViewStyle>; gradientColors?: readonly string[];
}>) {
  const gradient = `linear-gradient(115deg, ${(gradientColors && gradientColors.length >= 2 ? gradientColors : gradients[tone]).join(', ')})`;
  return <View style={[{ backgroundColor: colors.primary, backgroundImage: gradient, overflow: 'hidden' }, style]}>
    {readable && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,30,65,0.42)' }]} />}
    {children}
  </View>;
}

export function Screen({ children, header, footer, scroll = true }: PropsWithChildren<{
  header?: ReactNode; footer?: ReactNode; scroll?: boolean;
}>) {
  const content = <View style={styles.content}>{children}</View>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
    {header}
    {scroll ? <ScrollView style={styles.fill} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      {content}
    </ScrollView> : <View style={styles.fill}>{content}</View>}
    {footer}
  </SafeAreaView>;
}

export function SurfaceCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function BrandHeader({ title, subtitle, icon, tone = 'brand', action }: {
  title: string; subtitle?: string; icon?: IconName; tone?: GradientName; action?: ReactNode;
}) {
  return <GradientSurface tone={tone} readable style={styles.header}>
    <View style={styles.headerContent}>
      <View style={styles.headerRow}>
        {icon ? <View style={styles.iconBox}><AppIcon name={icon} color={colors.surface} /></View>
          : <Image source={require('../../assets/figma-make/logo_pet__1_.png')}
            accessibilityLabel="PET-TECHSUS" resizeMode="contain" style={styles.logo} />}
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {action}
      </View>
    </View>
  </GradientSurface>;
}
const styles = StyleSheet.create({
  fill: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 }, content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: spacing.lg, gap: spacing.lg },
  card: { ...cardShadow, backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  header: { padding: spacing.xxl }, headerContent: { width: '100%', maxWidth: layout.maxWidth - 48, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, heading: { flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: radii.field, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 52, height: 52, borderRadius: radii.icon, backgroundColor: colors.surface },
  title: { ...type.title, color: colors.surface }, subtitle: { ...type.small, color: colors.surface, marginTop: spacing.xs },
});
