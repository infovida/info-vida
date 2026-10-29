import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { GradientButton } from '../../components/controls';
import { EmptyState, InlineNotice } from '../../components/feedback';
import { GradientSurface, SurfaceCard } from '../../components/layout';
import { demoQuizResult } from '../../domain/quizSession';
import { colors, radii, spacing, type } from '../../theme/tokens';
import { QuizFrame } from './QuizComponents';
import { useQuizSessions } from './QuizSessionProvider';

export function QuizResultScreen({ attemptId }: { attemptId: string }) {
  const { sessions, start } = useQuizSessions();
  const session = sessions[attemptId]; const result = session && demoQuizResult(session);
  const displayResult = !!result && !!session;
  useFocusEffect(useCallback(() => {
    setStatusBarStyle(displayResult ? 'light' : 'dark');
    return () => setStatusBarStyle('dark');
  }, [displayResult]));
  const opening = useRef(false); const [error, setError] = useState(false);
  const repeat = () => {
    if (!session || opening.current) return;
    opening.current = true;
    try {
      const sessionId = start(session.category, session.pool, session.mode);
      router.replace({ pathname: '/quiz/session', params: { sessionId } });
    } catch { opening.current = false; setError(true); }
  };
  if (!result || !session) return <QuizFrame><EmptyState title="Resultado não disponível" message="Escolha uma categoria para começar uma nova demonstração."
    action={{ label: 'Categorias', onPress: () => router.dismissTo('/quiz') }} /></QuizFrame>;
  return <QuizFrame result>
    <SurfaceCard>
      <GradientSurface tone="education" readable style={styles.medal}><AppIcon name="trophy" size={40} color={colors.surface} /></GradientSurface>
      <Text accessibilityRole="header" style={styles.title}>{result.percentage === 100 ? 'Excelente!' : result.percentage >= 50 ? 'Muito bem!' : 'Continue aprendendo!'}</Text>
      <Text style={styles.subtitle}>Quiz de {session.category.label} concluído</Text>
      <GradientSurface readable tone="action" style={styles.score}>
        <Text style={styles.scoreLabel}>Pontuação final</Text>
        <Text style={styles.scoreNumber}>{result.correct} de {result.total}</Text>
        <Text style={styles.scoreLabel}>{result.percentage}% de acertos</Text>
      </GradientSurface>
      <InlineNotice message="Resultado de demonstração — progresso não salvo" />
      <Text style={styles.subtitle}>Esta rodada não concede XP, conquistas ou sequência de dias.</Text>
      {error && <InlineNotice tone="error" message="Não foi possível abrir outra rodada. Tente novamente." />}
      <GradientButton label="Categorias" variant="secondary" onPress={() => router.dismissTo('/quiz')} />
      <GradientButton label="Repetir" onPress={repeat} />
      <GradientButton label="Voltar para o início" variant="secondary" icon="home" onPress={() => router.dismissTo('/home')} />
    </SurfaceCard>
  </QuizFrame>;
}
const styles = StyleSheet.create({
  medal: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  title: { ...type.display, color: colors.primary, textAlign: 'center' }, subtitle: { ...type.small, color: colors.muted, textAlign: 'center' },
  score: { borderRadius: radii.field, overflow: 'hidden', padding: spacing.lg, gap: spacing.sm },
  scoreLabel: { ...type.small, color: colors.surface, textAlign: 'center' }, scoreNumber: { ...type.score, color: colors.surface, textAlign: 'center' },
});
