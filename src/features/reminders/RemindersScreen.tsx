import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../../components/AppIcon';
import { GradientButton } from '../../components/controls';
import { ConfirmDialog, EmptyState, ErrorState, InlineNotice, Toast } from '../../components/feedback';
import { GradientSurface, SurfaceCard } from '../../components/layout';
import { computeReminderStats, WATER_REMINDER_PRESET, type Reminder } from '../../domain/reminders';
import { cardShadow, colors, layout, radii, spacing, type } from '../../theme/tokens';
import { ReminderCard } from './ReminderCard';
import { useReminders } from './RemindersProvider';

export function RemindersScreen() {
  const {
    status,
    reminders,
    now,
    permission,
    notificationsEnabled,
    permissionBusy,
    unscheduledIds,
    busyIds,
    toastMessage,
    actionError,
    ensureLoaded,
    reload,
    refreshClock,
    dismissToast,
    activateNotifications,
    deactivateNotifications,
    openNotificationSettings,
    retrySchedules,
    toggleTakenToday,
    toggleReminderActive,
    removeReminder,
    createId,
    saveReminder,
  } = useReminders();

  const navigatingRef = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);
  const [quickAddBusy, setQuickAddBusy] = useState(false);

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  useFocusEffect(
    useCallback(() => {
      navigatingRef.current = false;
      refreshClock();
    }, [refreshClock]),
  );

  const stats = computeReminderStats(reminders, now);
  const actionsBlocked = status === 'loading' || status === 'idle' || status === 'corrupted' || status === 'error';

  const openCreate = () => {
    if (navigatingRef.current || actionsBlocked) return;
    navigatingRef.current = true;
    router.push('/reminders/editor');
  };

  const openEdit = (reminder: Reminder) => {
    if (navigatingRef.current || actionsBlocked) return;
    navigatingRef.current = true;
    router.push({ pathname: '/reminders/editor', params: { id: reminder.id } });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(undefined);
    try {
      await removeReminder(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setDeleteError('Não foi possível remover o lembrete neste aparelho. Tente novamente.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleQuickAddWater = async () => {
    if (navigatingRef.current || actionsBlocked || quickAddBusy) return;
    setQuickAddBusy(true);
    try {
      const waterReminder: Reminder = {
        id: createId(),
        name: WATER_REMINDER_PRESET.name,
        dose: WATER_REMINDER_PRESET.dose,
        time: WATER_REMINDER_PRESET.time,
        days: [...WATER_REMINDER_PRESET.days],
        active: WATER_REMINDER_PRESET.active,
        notes: WATER_REMINDER_PRESET.notes,
      };
      await saveReminder(waterReminder, 'create');
    } finally {
      setQuickAddBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <FlatList
        testID="reminders-list"
        data={status === 'ready' ? reminders : []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <GradientSurface tone="reminders" readable style={styles.hero}>
              <View style={styles.heroInner}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroIconBox}>
                    <AppIcon name="pill" color={colors.surface} size={24} />
                  </View>
                  <View style={styles.flex}>
                    <Text accessibilityRole="header" style={styles.heroTitle}>
                      Lembretes de Medicamentos
                    </Text>
                    <Text style={styles.heroSubtitle}>
                      Acompanhe seus horários de forma simples
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View
                    accessible
                    accessibilityLabel={`Total de lembretes: ${stats.total}`}
                    style={styles.statCard}
                  >
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  <View
                    accessible
                    accessibilityLabel={`Lembretes ativos: ${stats.active}`}
                    style={styles.statCard}
                  >
                    <Text style={styles.statValue}>{stats.active}</Text>
                    <Text style={styles.statLabel}>Ativos</Text>
                  </View>
                  <View
                    accessible
                    accessibilityLabel={`Tomados hoje: ${stats.takenToday}`}
                    style={styles.statCard}
                  >
                    <Text style={styles.statValue}>{stats.takenToday}</Text>
                    <Text style={styles.statLabel}>Tomados hoje</Text>
                  </View>
                </View>
              </View>
            </GradientSurface>

            <View style={styles.bannersContainer}>
              {(permission === 'undetermined' || (permission === 'granted' && !notificationsEnabled)) && (
                <View style={[styles.bannerCard, styles.amberBanner]}>
                  <AppIcon name="bellOff" color={colors.warning} size={22} />
                  <Text style={styles.amberBannerText}>
                    Ative as notificações para receber alertas no horário do seu remédio.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ativar notificações"
                    accessibilityState={{ disabled: permissionBusy, busy: permissionBusy }}
                    disabled={permissionBusy}
                    onPress={() => { void activateNotifications(); }}
                    style={({ pressed }) => [
                      styles.amberButton,
                      pressed && styles.pressed,
                      permissionBusy && styles.disabled,
                    ]}
                  >
                    <Text style={styles.amberButtonText}>{permissionBusy ? 'Ativando…' : 'Ativar'}</Text>
                  </Pressable>
                </View>
              )}

              {permission === 'denied' && (
                <View style={[styles.bannerCard, styles.amberBanner]}>
                  <AppIcon name="bellOff" color={colors.warning} size={22} />
                  <Text style={styles.amberBannerText}>
                    Ative as notificações para receber alertas no horário do seu remédio.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ativar notificações"
                    onPress={() => { void openNotificationSettings(); }}
                    style={({ pressed }) => [styles.amberButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.amberButtonText}>Ativar</Text>
                  </Pressable>
                </View>
              )}

              {permission === 'unavailable' && (
                <View style={[styles.bannerCard, styles.amberBanner]}>
                  <AppIcon name="bellOff" color={colors.warning} size={22} />
                  <Text style={styles.amberBannerText}>
                    Alertas do sistema não estão disponíveis neste ambiente. Seus lembretes continuam salvos neste aparelho.
                  </Text>
                </View>
              )}

              {permission === 'granted' && notificationsEnabled && (
                <View style={[styles.bannerCard, styles.greenBanner]}>
                  <AppIcon name="reminders" color={colors.success} size={20} active />
                  <Text style={styles.greenBannerText}>
                    Notificações ativas: alertas 30 minutos antes e no horário de cada lembrete ativo.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Pausar todas as notificações"
                    accessibilityState={{ disabled: permissionBusy }}
                    disabled={permissionBusy}
                    onPress={() => { void deactivateNotifications(); }}
                    style={({ pressed }) => [styles.greenButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.greenButtonText}>Pausar</Text>
                  </Pressable>
                </View>
              )}

              {permission === 'granted' && notificationsEnabled && unscheduledIds.length > 0 && (
                <View style={[styles.bannerCard, styles.amberBanner]}>
                  <AppIcon name="warning" color={colors.warning} size={20} />
                  <Text style={styles.amberBannerText}>
                    Salvo neste aparelho; aviso não agendado para {unscheduledIds.length}{' '}
                    {unscheduledIds.length === 1 ? 'lembrete' : 'lembretes'}.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Tentar agendar avisos novamente"
                    onPress={() => { void retrySchedules(); }}
                    style={({ pressed }) => [styles.amberButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.amberButtonText}>Repetir</Text>
                  </Pressable>
                </View>
              )}

              <View accessible style={styles.attentionCard}>
                <AppIcon name="warning" color={colors.dangerText} size={22} />
                <Text style={styles.attentionText}>
                  <Text style={styles.bold}>Atenção:</Text> Não altere doses, não interrompa tratamentos e não combine medicamentos sem orientação do seu médico ou farmacêutico.
                </Text>
              </View>

              <View style={styles.quickAddSection}>
                <Text accessibilityRole="header" style={styles.quickAddHeading}>
                  Adicionar rápido
                </Text>
                <SurfaceCard style={styles.quickAddCard}>
                  <View style={styles.quickAddRow}>
                    <View style={styles.quickAddIconBox}>
                      <Text style={styles.quickAddEmoji}>💧</Text>
                    </View>
                    <View style={styles.quickAddInfo}>
                      <View style={styles.quickAddTitleRow}>
                        <Text style={styles.quickAddTitle}>Água 💧</Text>
                        <View style={styles.quickAddTimePill}>
                          <AppIcon name="clock" color={colors.primary} size={12} active />
                          <Text style={styles.quickAddTimeText}>08:00 • Todos os dias</Text>
                        </View>
                      </View>
                      <Text style={styles.quickAddDose}>1 a 2 copos de água</Text>
                      <Text style={styles.quickAddNotes} numberOfLines={1}>
                        Beber pelo menos 2 litros de água por dia
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Adicionar lembrete de água"
                      accessibilityState={{ disabled: actionsBlocked || quickAddBusy }}
                      disabled={actionsBlocked || quickAddBusy}
                      onPress={() => { void handleQuickAddWater(); }}
                      style={({ pressed }) => [
                        styles.quickAddBtn,
                        pressed && styles.pressed,
                        (actionsBlocked || quickAddBusy) && styles.disabled,
                      ]}
                    >
                      <AppIcon name="plus" color={colors.surface} size={16} active />
                      <Text style={styles.quickAddBtnText}>
                        {quickAddBusy ? '…' : 'Adicionar'}
                      </Text>
                    </Pressable>
                  </View>
                </SurfaceCard>
              </View>

              <View style={styles.howToCard}>
                <Text accessibilityRole="header" style={styles.howToTitle}>
                  Como usar esta tela:
                </Text>
                <Text style={styles.howToItem}>
                  {'• Toque em '}
                  <Text style={styles.howToTaken}>✓ Tomei</Text>
                  {' quando tomar o medicamento'}
                </Text>
                <Text style={styles.howToItem}>
                  • Toque no sino para ativar ou pausar um lembrete
                </Text>
                <Text style={styles.howToItem}>
                  • Toque no lápis para editar ou na lixeira para remover um lembrete
                </Text>
                <Text style={styles.howToItem}>
                  {'• Toque em '}
                  <Text style={styles.howToAdd}>+ Adicionar lembrete</Text>
                  {' para criar um novo'}
                </Text>
              </View>

              {actionError && <InlineNotice tone="error" message={actionError} />}

              {status === 'ready' && reminders.length > 0 && (
                <Text accessibilityRole="header" style={styles.sectionHeading}>
                  Seus lembretes
                </Text>
              )}
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ReminderCard
              reminder={item}
              now={now}
              busy={busyIds.includes(item.id)}
              scheduleWarning={unscheduledIds.includes(item.id)}
              onToggleTaken={() => { void toggleTakenToday(item.id); }}
              onToggleActive={() => { void toggleReminderActive(item.id); }}
              onEdit={() => openEdit(item)}
              onDelete={() => {
                setDeleteError(undefined);
                setDeleteTarget(item);
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.cardWrapper}>
            {status === 'loading' || status === 'idle' ? (
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel="Carregando lembretes"
                style={styles.loadingBox}
              >
                <Text style={styles.loadingText}>Carregando lembretes…</Text>
              </View>
            ) : status === 'error' ? (
              <ErrorState onRetry={() => { void reload(); }} />
            ) : status === 'corrupted' ? (
              <EmptyState
                title="Dados locais precisam de atenção"
                message="Os dados salvos de lembretes neste aparelho estão em um formato inválido e foram preservados sem alteração. As ações de edição ficam bloqueadas até a recuperação."
                action={{ label: 'Tentar novamente', onPress: () => { void reload(); } }}
              />
            ) : (
              <EmptyState
                title="Nenhum lembrete ainda"
                message="Toque em + Adicionar lembrete para cadastrar seu medicamento com horário, dias da semana e alertas 30 minutos antes e na hora."
                action={{ label: 'Criar primeiro lembrete', onPress: openCreate }}
              />
            )}
          </View>
        }
      />

      {toastMessage && <Toast message={toastMessage} onDismiss={dismissToast} />}

      <View style={styles.footerCta}>
        <View style={styles.footerCtaInner}>
          <GradientButton
            label="Adicionar lembrete"
            icon="plus"
            size="large"
            disabled={actionsBlocked}
            onPress={openCreate}
          />
        </View>
      </View>

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Remover lembrete?"
        message={
          deleteTarget
            ? `Deseja remover "${deleteTarget.name}" deste aparelho? Os alertas agendados para este lembrete serão cancelados.`
            : ''
        }
        confirmLabel="Confirmar remoção"
        cancelLabel="Cancelar"
        destructive
        busy={deleteBusy}
        error={deleteError}
        onCancel={() => {
          if (!deleteBusy) {
            setDeleteTarget(null);
            setDeleteError(undefined);
          }
        }}
        onConfirm={() => { void handleConfirmDelete(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  headerWrapper: {
    marginBottom: spacing.md,
  },
  hero: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl + spacing.sm,
  },
  heroInner: {
    width: '100%',
    maxWidth: layout.maxWidth - 48,
    alignSelf: 'center',
    gap: spacing.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.field,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...type.section,
    fontSize: 22,
    lineHeight: 28,
    color: colors.surface,
  },
  heroSubtitle: {
    ...type.small,
    color: colors.surface,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.base,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statValue: {
    ...type.title,
    fontSize: 28,
    lineHeight: 34,
    color: colors.surface,
  },
  statLabel: {
    ...type.caption,
    color: colors.surface,
    textAlign: 'center',
  },
  bannersContainer: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    gap: spacing.md,
  },
  bannerCard: {
    ...cardShadow,
    borderRadius: radii.base,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
  },
  amberBanner: {
    backgroundColor: colors.warningSoft,
    borderColor: '#FDE68A',
  },
  amberBannerText: {
    ...type.small,
    flex: 1,
    color: colors.warning,
    fontWeight: '600',
  },
  amberButton: {
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.lg,
    borderRadius: 99,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amberButtonText: {
    ...type.small,
    color: colors.warning,
    fontWeight: '700',
  },
  greenBanner: {
    backgroundColor: colors.successSoft,
    borderColor: '#BBF7D0',
  },
  greenBannerText: {
    ...type.small,
    flex: 1,
    color: colors.success,
    fontWeight: '600',
  },
  greenButton: {
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.lg,
    borderRadius: 99,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenButtonText: {
    ...type.small,
    color: colors.success,
    fontWeight: '700',
  },
  attentionCard: {
    borderRadius: radii.base,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  attentionText: {
    ...type.small,
    flex: 1,
    color: colors.dangerText,
  },
  bold: {
    fontWeight: '700',
  },
  quickAddSection: {
    gap: spacing.sm,
  },
  quickAddHeading: {
    ...type.subtitle,
    fontSize: 16,
    fontWeight: '700',
    color: colors.title,
    marginTop: spacing.xs,
  },
  quickAddCard: {
    padding: spacing.md + 2,
    gap: 0,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickAddIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.field,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#7DD3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddEmoji: {
    fontSize: 24,
  },
  quickAddInfo: {
    flex: 1,
    gap: 2,
  },
  quickAddTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAddTitle: {
    ...type.label,
    fontWeight: '700',
    color: colors.title,
  },
  quickAddTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  quickAddTimeText: {
    ...type.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  quickAddDose: {
    ...type.small,
    color: colors.body,
    fontWeight: '500',
  },
  quickAddNotes: {
    ...type.caption,
    color: colors.muted,
    fontStyle: 'italic',
  },
  quickAddBtn: {
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.md,
    borderRadius: 99,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  quickAddBtnText: {
    ...type.small,
    color: colors.surface,
    fontWeight: '700',
  },
  howToCard: {
    borderRadius: radii.base,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: spacing.lg,
    gap: 6,
  },
  howToTitle: {
    ...type.small,
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  howToItem: {
    ...type.small,
    color: colors.body,
  },
  howToTaken: {
    color: colors.success,
    fontWeight: '700',
  },
  howToAdd: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionHeading: {
    ...type.subtitle,
    fontWeight: '700',
    color: colors.title,
    marginTop: spacing.xs,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingBox: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    ...type.body,
    color: colors.muted,
  },
  footerCta: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  footerCtaInner: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.55,
  },
});
