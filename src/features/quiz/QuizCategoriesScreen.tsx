import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { EmptyState, InlineNotice } from '../../components/feedback';
import { GradientSurface } from '../../components/layout';
import { StreakCalendar } from '../../components/StreakCalendar';
import type { QuizCategory } from '../../domain/quiz';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import type { QuizRepository } from '../../services/contracts';
import { cardShadow, colors, radii, spacing, type } from '../../theme/tokens';
import { decodeDemoQuiz, demoQuizRepository } from './demoQuizRepository';
import { QuizDemoNotice, QuizFrame, QuizHeading } from './QuizComponents';
import { useQuizSessions } from './QuizSessionProvider';

type Activity = { status: 'ready'; dates: readonly string[] } | { status: 'unavailable' };
export function QuizCategoriesScreen({ repository = demoQuizRepository, activity = { status: 'unavailable' } }: {
  repository?: QuizRepository; activity?: Activity;
}) {
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 360 || fontScale >= 1.4;
  const { start } = useQuizSessions();
  const starting = useRef(false);
  const [startError, setStartError] = useState(false);
  useFocusEffect(useCallback(() => { starting.current = false; }, []));
  const load = useCallback(async () => {
    const [categories, questions] = await Promise.all([repository.categories(), repository.questions()]);
    return decodeDemoQuiz(categories, questions);
  }, [repository]);
  const { result, retry } = useAsyncResource(load);
  const startCategory = (category: QuizCategory, random = false) => {
    if (starting.current || result.status !== 'ready') return;
    const pool = random ? result.data.questions : category.questionIds.map(id => result.data.questions.find(q => q.id === id)!);
    if (!pool.length) return;
    starting.current = true; setStartError(false);
    try {
      const sessionId = start(category, pool, random ? 'random' : 'category');
      router.push({ pathname: '/quiz/session', params: { sessionId } });
    } catch { starting.current = false; setStartError(true); }
  };
  const total = result.status === 'ready' ? result.data.questions.length : 0;
  return <QuizFrame withTabBar={false} header={<QuizHeading title="Quiz InfoVida" subtitle="Escolha uma categoria para começar">
    {activity.status === 'ready' ? <StreakCalendar dates={activity.dates} compact />
      : <View style={styles.activity}><AppIcon name="flame" color={colors.surface} size={24} />
        <View style={styles.flex}><Text style={styles.activityTitle}>Progresso indisponível</Text>
          <Text style={styles.activityBody}>As rodadas de demonstração não alteram sua sequência.</Text></View></View>}
  </QuizHeading>}>
    <QuizDemoNotice />
    {startError && <InlineNotice tone="error" message="Não foi possível abrir a rodada. Tente novamente." />}
    {result.status === 'loading' ? <View accessible accessibilityRole="progressbar" accessibilityLabel="Carregando categorias">
      <Text style={styles.body}>Carregando categorias…</Text></View>
      : result.status === 'error' ? <EmptyState title="Não foi possível carregar o Quiz" message="Tente novamente para ver as categorias."
        action={{ label: 'Tentar novamente', onPress: retry }} />
        : !result.data.categories.length ? <EmptyState title="Nenhuma categoria disponível" message="Os conteúdos estão em preparação."
          action={{ label: 'Voltar ao início', onPress: () => router.navigate('/home') }} /> : <>
          <Pressable accessibilityRole="button" accessibilityLabel="Quiz Aleatório" accessibilityState={{ disabled: total === 0 }} disabled={!total}
            onPress={() => startCategory({ id: 'aleatorio', label: 'Aleatório', emoji: '🎲', gradientColors: [colors.primary, colors.accent], questionIds: result.data.questions.map(q => q.id) }, true)}>
            <GradientSurface tone="education" readable style={styles.random}>
              <View style={styles.diceBox}><Text accessible={false} style={styles.dice}>🎲</Text></View>
              <View style={styles.flex}><Text style={styles.randomTitle}>Quiz Aleatório</Text>
                <Text style={styles.randomBody}>{total ? `${Math.min(5, total)} perguntas de todas as categorias` : 'Em preparação'}</Text></View>
              <AppIcon name="shuffle" color={colors.surface} />
            </GradientSurface>
          </Pressable>
          <Text style={styles.body}>ou escolha uma categoria:</Text>
          <View style={styles.grid}>
            {result.data.categories.map(category => <Pressable key={category.id} accessibilityRole="button"
              accessibilityLabel={`Quiz de ${category.label}`} accessibilityHint={`${category.questionIds.length} perguntas de demonstração`}
              accessibilityState={{ disabled: !category.questionIds.length }} disabled={!category.questionIds.length}
              onPress={() => startCategory(category)} style={({ pressed }) => [styles.category, { width: singleColumn ? '100%' : '48%' }, pressed && { opacity: 0.85 }]}>
              <GradientSurface gradientColors={category.gradientColors} style={styles.categoryIcon}>
                <Text accessible={false} style={styles.emoji}>{category.emoji}</Text></GradientSurface>
              <Text style={styles.categoryTitle}>{category.label}</Text>
              <Text style={styles.caption}>{category.questionIds.length ? `${category.questionIds.length} perguntas` : 'Em preparação'}</Text>
            </Pressable>)}
          </View>
        </>}
  </QuizFrame>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 }, body: { ...type.small, color: colors.muted },
  activity: { padding: spacing.lg, borderRadius: radii.field, backgroundColor: 'rgba(255,255,255,0.14)', flexDirection: 'row', gap: spacing.md },
  activityTitle: { ...type.label, color: colors.surface }, activityBody: { ...type.caption, color: colors.surface },
  random: { padding: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderRadius: radii.card, overflow: 'hidden' },
  diceBox: { width: 64, height: 64, borderRadius: radii.field, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  dice: { fontSize: 32 }, randomTitle: { ...type.section, color: colors.surface }, randomBody: { ...type.small, color: colors.surface },
  grid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  category: { ...cardShadow, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radii.card, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  categoryIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radii.field },
  emoji: { fontSize: 28 }, categoryTitle: { ...type.label, fontWeight: '700', color: colors.title }, caption: { ...type.caption, color: colors.muted },
});
