import { router, usePreventRemove } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../../components/AppIcon';
import { GradientButton } from '../../components/controls';
import { ConfirmDialog, EmptyState, ErrorState, InlineNotice } from '../../components/feedback';
import { SurfaceCard } from '../../components/layout';
import {
  DAY_PRESETS,
  WEEKDAYS,
  WEEKDAY_FULL_LABELS,
  WEEKDAY_SHORT_LABELS,
  adjustTimeByMinutes,
  validateReminderDraft,
  type ReminderFieldErrors,
} from '../../domain/reminders';
import { colors, layout, radii, spacing, type } from '../../theme/tokens';
import { useReminders } from './RemindersProvider';

const QUICK_TIMES = ['08:00', '12:00', '18:00', '20:00'] as const;

function sameDays(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((value, idx) => value === sortedB[idx]);
}

export function ReminderEditorScreen({
  reminderId,
  preset,
}: {
  reminderId?: string;
  preset?: string;
}) {
  const { status, reminders, ensureLoaded, reload, createId, saveReminder } = useReminders();
  const isEditMode = typeof reminderId === 'string' && reminderId.length > 0;

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  const existing = useMemo(
    () => (isEditMode ? reminders.find(item => item.id === reminderId) : undefined),
    [isEditMode, reminderId, reminders],
  );

  const [draftId] = useState(() => createId());

  const initialValues = useMemo(() => {
    if (existing) {
      return {
        name: existing.name,
        dose: existing.dose,
        time: existing.time,
        days: [...existing.days].sort((a, b) => a - b),
        notes: existing.notes ?? '',
        active: existing.active,
      };
    }
    if (preset === 'water') {
      return {
        name: 'Água',
        dose: '',
        time: '08:00',
        days: [...DAY_PRESETS.all],
        notes: '',
        active: true,
      };
    }
    return {
      name: '',
      dose: '',
      time: '08:00',
      days: [...DAY_PRESETS.all],
      notes: '',
      active: true,
    };
  }, [existing, preset]);

  const hydratedIdRef = useRef<string | null>(null);
  const [name, setName] = useState(initialValues.name);
  const [dose, setDose] = useState(initialValues.dose);
  const [time, setTime] = useState(initialValues.time);
  const [days, setDays] = useState<number[]>(initialValues.days);
  const [notes, setNotes] = useState(initialValues.notes);
  const [active, setActive] = useState(initialValues.active);

  useEffect(() => {
    if (existing && hydratedIdRef.current !== existing.id) {
      hydratedIdRef.current = existing.id;
      setName(existing.name);
      setDose(existing.dose);
      setTime(existing.time);
      setDays([...existing.days].sort((a, b) => a - b));
      setNotes(existing.notes ?? '');
      setActive(existing.active);
    }
  }, [existing]);

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ReminderFieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const savingRef = useRef(false);
  const pendingExitRef = useRef<(() => void) | null>(null);

  const nameInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const doseInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const timeInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const notesInputRef = useRef<ComponentRef<typeof TextInput>>(null);

  const canEvaluateDirty = !isEditMode || existing !== undefined;
  const hasChanges = canEvaluateDirty && (
    name !== initialValues.name
    || dose !== initialValues.dose
    || time !== initialValues.time
    || !sameDays(days, initialValues.days)
    || notes !== initialValues.notes
    || active !== initialValues.active
  );

  const disablePrevention = usePreventRemove(hasChanges && !leaving && !saving, ({ repeat }) => {
    if (savingRef.current) return;
    pendingExitRef.current = repeat;
    setConfirmDiscard(true);
  });

  const navigateToReminders = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/reminders');
    }
  };

  const requestClose = () => {
    if (savingRef.current) return;
    if (hasChanges) {
      pendingExitRef.current = () => {
        disablePrevention();
        navigateToReminders();
      };
      setConfirmDiscard(true);
    } else {
      navigateToReminders();
    }
  };

  const toggleDay = (day: number) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(item => item !== day) : [...prev, day].sort((a, b) => a - b),
    );
    if (fieldErrors.days) {
      setFieldErrors(prev => ({ ...prev, days: undefined }));
    }
  };

  const applyPresetDays = (presetDays: readonly number[]) => {
    setDays([...presetDays]);
    if (fieldErrors.days) {
      setFieldErrors(prev => ({ ...prev, days: undefined }));
    }
  };

  const handleTimeChange = (rawValue: string) => {
    setTime(rawValue);
    if (fieldErrors.time) {
      setFieldErrors(prev => ({ ...prev, time: undefined }));
    }
  };

  const handleSave = async () => {
    if (savingRef.current) return;
    setSaveError(null);

    const validation = validateReminderDraft(
      {
        id: existing?.id ?? draftId,
        name,
        dose,
        time,
        days,
        notes,
        active,
      },
      existing,
    );

    if (!validation.ok) {
      setFieldErrors(validation.errors);
      if (validation.firstField === 'name') nameInputRef.current?.focus();
      else if (validation.firstField === 'dose') doseInputRef.current?.focus();
      else if (validation.firstField === 'time') timeInputRef.current?.focus();
      else if (validation.firstField === 'notes') notesInputRef.current?.focus();
      return;
    }

    setFieldErrors({});
    savingRef.current = true;
    setSaving(true);
    try {
      await saveReminder(validation.reminder, isEditMode ? 'edit' : 'create');
      setLeaving(true);
      disablePrevention();
      navigateToReminders();
    } catch {
      savingRef.current = false;
      setSaving(false);
      setSaveError('Não foi possível salvar o lembrete neste aparelho. Suas alterações foram mantidas para tentar novamente.');
    }
  };

  if (status === 'idle' || status === 'loading') {
    return (
      <SafeAreaView style={styles.screen}>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Carregando formulário de lembrete"
          style={styles.stateContainer}
        >
          <Text style={styles.loadingText}>Carregando…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.stateContainer}>
          <ErrorState onRetry={() => { void reload(); }} />
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'corrupted') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.stateContainer}>
          <EmptyState
            title="Edição temporariamente bloqueada"
            message="Os dados salvos de lembretes estão em formato inválido e foram preservados para evitar perda de informações."
            action={{ label: 'Voltar aos lembretes', onPress: navigateToReminders }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isEditMode && !existing) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.stateContainer}>
          <EmptyState
            title="Lembrete não encontrado"
            message="Este lembrete não foi localizado neste aparelho."
            action={{ label: 'Voltar aos lembretes', onPress: navigateToReminders }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarInner}>
            <View style={styles.flex}>
              <Text accessibilityRole="header" style={styles.modalTitle}>
                {isEditMode ? 'Editar lembrete' : 'Novo lembrete'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isEditMode
                  ? 'Atualize os dados do seu medicamento'
                  : 'Cadastre horário, dias da semana e alertas'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar formulário"
              accessibilityState={{ disabled: saving }}
              disabled={saving}
              onPress={requestClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <AppIcon name="close" color={colors.body} size={22} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <SurfaceCard style={styles.formCard}>
            {/* 1. Nome */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nome do medicamento *</Text>
              <View
                style={[
                  styles.inputRow,
                  focusedField === 'name' && styles.inputFocused,
                  !!fieldErrors.name && styles.inputError,
                ]}
              >
                <AppIcon name="pill" color={colors.primary} size={20} />
                <TextInput
                  ref={nameInputRef}
                  accessibilityLabel="Nome do medicamento"
                  placeholder="Nome do seu lembrete"
                  placeholderTextColor={colors.muted}
                  value={name}
                  editable={!saving}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(prev => (prev === 'name' ? null : prev))}
                  onChangeText={value => {
                    setName(value);
                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  style={styles.textInput}
                />
              </View>
              {fieldErrors.name && (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {fieldErrors.name}
                </Text>
              )}
            </View>

            {/* 2. Dosagem */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Dosagem</Text>
              <View
                style={[
                  styles.inputRow,
                  focusedField === 'dose' && styles.inputFocused,
                  !!fieldErrors.dose && styles.inputError,
                ]}
              >
                <TextInput
                  ref={doseInputRef}
                  accessibilityLabel="Dosagem"
                  placeholder="Conforme sua orientação de uso"
                  placeholderTextColor={colors.muted}
                  value={dose}
                  editable={!saving}
                  onFocus={() => setFocusedField('dose')}
                  onBlur={() => setFocusedField(prev => (prev === 'dose' ? null : prev))}
                  onChangeText={value => {
                    setDose(value);
                    if (fieldErrors.dose) setFieldErrors(prev => ({ ...prev, dose: undefined }));
                  }}
                  style={styles.textInput}
                />
              </View>
              {fieldErrors.dose && (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {fieldErrors.dose}
                </Text>
              )}
            </View>

            {/* 3. Horário para tomar */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Horário para tomar (HH:mm) *</Text>
              <View
                style={[
                  styles.inputRow,
                  focusedField === 'time' && styles.inputFocused,
                  !!fieldErrors.time && styles.inputError,
                ]}
              >
                <AppIcon name="clock" color={colors.primary} size={20} active />
                <TextInput
                  ref={timeInputRef}
                  accessibilityLabel="Horário para tomar"
                  placeholder="08:00"
                  placeholderTextColor={colors.muted}
                  keyboardType="numbers-and-punctuation"
                  value={time}
                  editable={!saving}
                  onFocus={() => setFocusedField('time')}
                  onBlur={() => setFocusedField(prev => (prev === 'time' ? null : prev))}
                  onChangeText={handleTimeChange}
                  style={styles.timeInput}
                />
                <View style={styles.timeSteppers}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Diminuir 15 minutos"
                    disabled={saving}
                    onPress={() => handleTimeChange(adjustTimeByMinutes(time, -15))}
                    style={({ pressed }) => [styles.stepperBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.stepperText}>-15m</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Aumentar 15 minutos"
                    disabled={saving}
                    onPress={() => handleTimeChange(adjustTimeByMinutes(time, 15))}
                    style={({ pressed }) => [styles.stepperBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.stepperText}>+15m</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.quickTimesRow}>
                {QUICK_TIMES.map(presetTime => {
                  const selected = time.trim() === presetTime;
                  return (
                    <Pressable
                      key={presetTime}
                      accessibilityRole="button"
                      accessibilityLabel={`Definir horário ${presetTime}`}
                      accessibilityState={{ selected, disabled: saving }}
                      disabled={saving}
                      onPress={() => handleTimeChange(presetTime)}
                      style={({ pressed }) => [
                        styles.presetChip,
                        selected && styles.presetChipSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.presetChipText, selected && styles.presetChipTextSelected]}>
                        {presetTime}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {fieldErrors.time && (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {fieldErrors.time}
                </Text>
              )}
            </View>

            {/* 4. Dias da semana + Botões de atalho */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Dias da semana *</Text>

              <View style={styles.presetsRow}>
                {[
                  { key: 'all', label: 'Todos os dias', values: DAY_PRESETS.all },
                  { key: 'weekdays', label: 'Dias úteis', values: DAY_PRESETS.weekdays },
                  { key: 'weekend', label: 'Fins de semana', values: DAY_PRESETS.weekend },
                ].map(shortcut => {
                  const selected = sameDays(days, shortcut.values);
                  return (
                    <Pressable
                      key={shortcut.key}
                      accessibilityRole="button"
                      accessibilityLabel={shortcut.label}
                      accessibilityState={{ selected, disabled: saving }}
                      disabled={saving}
                      onPress={() => applyPresetDays(shortcut.values)}
                      style={({ pressed }) => [
                        styles.presetChip,
                        selected && styles.presetChipSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.presetChipText, selected && styles.presetChipTextSelected]}>
                        {shortcut.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.weekdaysGrid}>
                {WEEKDAYS.map(day => {
                  const selected = days.includes(day);
                  return (
                    <Pressable
                      key={day}
                      accessibilityRole="button"
                      accessibilityLabel={WEEKDAY_FULL_LABELS[day]}
                      accessibilityState={{ selected, disabled: saving }}
                      disabled={saving}
                      onPress={() => toggleDay(day)}
                      style={({ pressed }) => [
                        styles.dayChip,
                        selected ? styles.dayChipSelected : styles.dayChipUnselected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          selected ? styles.dayChipTextSelected : styles.dayChipTextUnselected,
                        ]}
                      >
                        {WEEKDAY_SHORT_LABELS[day]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {fieldErrors.days && (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {fieldErrors.days}
                </Text>
              )}
            </View>

            {/* 5. Opção de notificação (30 min antes e na hora) */}
            <View style={styles.notificationToggleBox}>
              <View style={styles.flex}>
                <Text style={styles.fieldLabel}>Notificações deste lembrete</Text>
                <Text style={styles.toggleHelpText}>
                  Receber alerta 30 minutos antes e na hora marcada para tomar
                </Text>
              </View>
              <Switch
                accessibilityLabel="Notificações deste lembrete"
                value={active}
                disabled={saving}
                onValueChange={setActive}
                trackColor={{ false: '#CBD5E1', true: colors.secondary }}
                thumbColor={active ? colors.primary : colors.surface}
              />
            </View>

            {/* 6. Observação (campo final) */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelWithCount}>
                <Text style={styles.fieldLabel}>Observações</Text>
                <Text style={styles.counterText}>{notes.length}/500</Text>
              </View>
              <View
                style={[
                  styles.notesInputBox,
                  focusedField === 'notes' && styles.inputFocused,
                  !!fieldErrors.notes && styles.inputError,
                ]}
              >
                <TextInput
                  ref={notesInputRef}
                  accessibilityLabel="Observações"
                  placeholder="Observações adicionais (opcional)"
                  placeholderTextColor={colors.muted}
                  multiline
                  textAlignVertical="top"
                  value={notes}
                  editable={!saving}
                  onFocus={() => setFocusedField('notes')}
                  onBlur={() => setFocusedField(prev => (prev === 'notes' ? null : prev))}
                  onChangeText={value => {
                    setNotes(value);
                    if (fieldErrors.notes) setFieldErrors(prev => ({ ...prev, notes: undefined }));
                  }}
                  style={styles.notesInput}
                />
              </View>
              {fieldErrors.notes && (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {fieldErrors.notes}
                </Text>
              )}
            </View>

            <InlineNotice
              tone="info"
              message="Preencha conforme a orientação que você já recebeu do profissional de saúde."
            />

            {saveError && <InlineNotice tone="error" message={saveError} />}

            <GradientButton
              label="Salvar lembrete"
              icon="check"
              size="large"
              loading={saving}
              onPress={() => { void handleSave(); }}
            />
          </SurfaceCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={confirmDiscard}
        title="Descartar alterações?"
        message="As alterações feitas neste formulário ainda não foram salvas."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        destructive
        onCancel={() => {
          setConfirmDiscard(false);
          pendingExitRef.current = null;
        }}
        onConfirm={() => {
          setLeaving(true);
          setConfirmDiscard(false);
          const action = pendingExitRef.current;
          pendingExitRef.current = null;
          action?.();
        }}
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
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    maxWidth: layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  loadingText: {
    ...type.body,
    color: colors.muted,
    textAlign: 'center',
  },
  topBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topBarInner: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    ...type.title,
    color: colors.title,
  },
  modalSubtitle: {
    ...type.small,
    color: colors.muted,
    marginTop: 2,
  },
  closeButton: {
    minWidth: layout.minTouch,
    minHeight: layout.minTouch,
    borderRadius: radii.icon,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  formCard: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  labelWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    ...type.small,
    fontWeight: '700',
    color: colors.title,
  },
  counterText: {
    ...type.caption,
    color: colors.muted,
  },
  inputRow: {
    minHeight: 56,
    borderRadius: radii.field,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputFocused: {
    borderColor: colors.focus,
  },
  inputError: {
    borderColor: colors.dangerText,
  },
  textInput: {
    ...type.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  timeInput: {
    ...type.subtitle,
    fontWeight: '700',
    flex: 1,
    color: colors.title,
    paddingVertical: spacing.md,
  },
  timeSteppers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepperBtn: {
    minHeight: layout.minTouch,
    minWidth: layout.minTouch,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.icon,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    ...type.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  quickTimesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.md + 2,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipSelected: {
    backgroundColor: colors.softBlue,
    borderColor: colors.primary,
  },
  presetChipText: {
    ...type.caption,
    fontSize: 13,
    color: colors.body,
    fontWeight: '600',
  },
  presetChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  weekdaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    minWidth: layout.minTouch,
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.md,
    borderRadius: radii.field,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipUnselected: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  dayChipText: {
    ...type.small,
    fontWeight: '700',
  },
  dayChipTextSelected: {
    color: colors.surface,
  },
  dayChipTextUnselected: {
    color: '#475569',
  },
  notificationToggleBox: {
    borderRadius: radii.field,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleHelpText: {
    ...type.caption,
    color: colors.muted,
    marginTop: 2,
  },
  notesInputBox: {
    borderRadius: radii.field,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  notesInput: {
    ...type.body,
    color: colors.text,
    minHeight: 88,
  },
  errorText: {
    ...type.caption,
    color: colors.dangerText,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.78,
  },
});
