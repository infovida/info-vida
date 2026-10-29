import { router } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../../components/AppIcon';
import { InlineNotice } from '../../components/feedback';
import { GradientSurface } from '../../components/layout';
import { AppTabBar } from '../../navigation/AppTabBar';
import { appTabs } from '../../navigation/tabs';
import { TabButton } from '../../navigation/TabButton';
import { colors, layout, radii, spacing, type } from '../../theme/tokens';

export function QuizDemoNotice() {
  return <InlineNotice message="Quiz de demonstração: exemplos sobre leitura de informações e uso do app. Esta rodada não salva progresso." />;
}
export function QuizHeading({ title, subtitle, emoji, gradientColors, children, action }: PropsWithChildren<{
  title: string; subtitle: string; emoji?: string; gradientColors?: readonly string[]; action?: ReactNode;
}>) {
  return <GradientSurface readable gradientColors={gradientColors} style={styles.header}>
    <View style={styles.headerContent}>
      <View style={styles.row}>
        <View style={styles.iconBox}>{emoji ? <Text accessible={false} style={styles.emoji}>{emoji}</Text> : <AppIcon name="quiz" color={colors.surface} />}</View>
        <View style={styles.flex}><Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text></View>
        {action}
      </View>
      {children}
    </View>
  </GradientSurface>;
}
export function QuizFrame({ children, header, footer, withTabBar = true, result = false, onTab }: PropsWithChildren<{
  header?: ReactNode; footer?: ReactNode; withTabBar?: boolean; result?: boolean; onTab?: (href: typeof appTabs[number]['href']) => void;
}>) {
  const content = <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, result && { backgroundColor: 'transparent' }]}>
    {header}
    <ScrollView style={styles.flex} contentContainerStyle={result ? styles.resultScroll : styles.scroll}>
      <View style={[styles.body, result && styles.resultBody]}>{children}</View>
    </ScrollView>
    {footer && <View style={styles.footer}>{footer}</View>}
    {withTabBar && <AppTabBar>{appTabs.map(tab => <TabButton key={tab.name} label={tab.label} icon={tab.icon}
      isFocused={tab.name === 'quiz'} onPress={() => onTab ? onTab(tab.href) : router.dismissTo(tab.href)} />)}</AppTabBar>}
  </SafeAreaView>;
  return result ? <GradientSurface readable style={styles.flex}>{content}</GradientSurface> : content;
}
const styles = StyleSheet.create({
  flex: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.xxl }, headerContent: { gap: spacing.lg, maxWidth: layout.maxWidth - 48, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, iconBox: { width: 48, height: 48,
    borderRadius: radii.field, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 }, title: { ...type.title, color: colors.surface }, subtitle: { ...type.small, color: colors.surface },
  scroll: { flexGrow: 1 }, resultScroll: { flexGrow: 1, justifyContent: 'center' },
  body: { padding: spacing.xl, gap: spacing.lg, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center' },
  resultBody: { maxWidth: 488 }, footer: { padding: spacing.lg, maxWidth: layout.maxWidth, width: '100%', alignSelf: 'center' },
});
