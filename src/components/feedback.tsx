import { useEffect, useRef, type ComponentRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout, radii, spacing, type } from '../theme/tokens';
import { AppIcon } from './AppIcon';
import { GradientButton, IconButton } from './controls';
import { SurfaceCard } from './layout';

export function InlineNotice({ message, tone = 'info' }: { message: string; tone?: 'info' | 'error' | 'success' | 'warning' }) {
  const palette = { info: [colors.softBlue, colors.primary], error: [colors.dangerSoft, colors.dangerText],
    success: [colors.successSoft, colors.success], warning: [colors.warningSoft, colors.warning] }[tone];
  return <View accessible accessibilityLabel={message} accessibilityRole={tone === 'error' ? 'alert' : undefined} accessibilityLiveRegion="polite"
    style={[styles.notice, { backgroundColor: palette[0] }]}>
    <AppIcon name={tone === 'success' ? 'check' : 'info'} color={palette[1]} size={20} />
    <Text style={[type.small, styles.flex, { color: palette[1] }]}>{message}</Text>
  </View>;
}

export function EmptyState({ title, message, action }: {
  title: string; message: string; action?: { label: string; onPress: () => void };
}) {
  return <SurfaceCard>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    <Text style={styles.body}>{message}</Text>
    {action && <GradientButton label={action.label} onPress={action.onPress} />}
  </SurfaceCard>;
}
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <EmptyState title="Não foi possível carregar" message="Seus dados não foram alterados. Tente novamente."
    action={{ label: 'Tentar novamente', onPress: onRetry }} />;
}

export function ConfirmDialog({ visible, title, message, onCancel, onConfirm, busy = false, error,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', destructive = false }: {
  visible: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void;
  busy?: boolean; error?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean;
}) {
  const heading = useRef<ComponentRef<typeof Text>>(null);
  const focusHeading = () => {
    if (Platform.OS === 'web') return;
    const tag = findNodeHandle(heading.current);
    if (tag != null) AccessibilityInfo.setAccessibilityFocus(tag);
  };
  return <Modal testID="confirmation-dialog" visible={visible} transparent animationType="none" onRequestClose={() => { if (!busy) onCancel(); }} onShow={focusHeading}>
    <SafeAreaView style={styles.overlay}>
      <ScrollView accessibilityViewIsModal role="dialog" aria-label={title} style={styles.dialog} contentContainerStyle={styles.dialogContent}>
        <Text ref={heading} accessible accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.body}>{message}</Text>
        {error && <InlineNotice tone="error" message={error} />}
        <GradientButton label={confirmLabel} onPress={onConfirm} loading={busy} variant={destructive ? 'danger' : 'primary'} />
        <GradientButton label={cancelLabel} onPress={onCancel} disabled={busy} variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

/** Render in the screen footer: remains above the tab bar instead of covering it. */
export function Toast({ message, onDismiss, duration = 5000 }: { message: string; onDismiss: () => void; duration?: number }) {
  useEffect(() => { const timer = setTimeout(onDismiss, duration); return () => clearTimeout(timer); }, [message, duration, onDismiss]);
  return <View accessibilityLiveRegion="polite" style={styles.toast}>
    <Text style={[styles.body, styles.flex]}>{message}</Text>
    <IconButton label="Fechar aviso" icon="close" onPress={onDismiss} />
  </View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, title: { ...type.section, color: colors.title }, body: { ...type.body, color: colors.body },
  notice: { borderRadius: radii.field, padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  dialog: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', maxHeight: '100%', flexGrow: 0, borderRadius: radii.card, backgroundColor: colors.surface },
  dialogContent: { padding: spacing.xxl, gap: spacing.lg },
  toast: { backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
