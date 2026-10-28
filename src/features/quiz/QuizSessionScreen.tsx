import { router, usePreventRemove } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { GradientButton, ProgressBar } from '../../components/controls';
import { ConfirmDialog, EmptyState, InlineNotice } from '../../components/feedback';
import { GradientSurface, SurfaceCard } from '../../components/layout';
import { appTabs } from '../../navigation/tabs';
import { colors, radii, spacing, type } from '../../theme/tokens';
import { QuizDemoNotice, QuizFrame, QuizHeading } from './QuizComponents';
import { useQuizSessions } from './QuizSessionProvider';

export function QuizSessionScreen({ sessionId }: { sessionId: string }) {
  const { sessions, update, discard } = useQuizSessions();
  const session = sessions[sessionId];
  const [confirmExit, setConfirmExit] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const pending = useRef<(() => void) | null>(null);
  const hasAnswers = !!session?.answers.some(answer => answer !== null);
  const disablePrevention = usePreventRemove(!!session && session.phase === 'questions' && hasAnswers && !leaving, ({ repeat }) => {
    pending.current = repeat; setConfirmExit(true);
  });
  useEffect(() => {
    if (session?.phase === 'result') router.replace({ pathname: '/quiz/result/[attemptId]', params: { attemptId: session.id } });
  }, [session?.phase, session?.id]);
  const exit = (target?: typeof appTabs[number]['href']) => {
    const navigate = () => router.dismissTo(target ?? '/quiz');
    if (hasAnswers) {
      pending.current = () => { disablePrevention(); navigate(); };
      setConfirmExit(true);
    } else {
      if (session) discard(session.id);
      navigate();
    }
  };
  if (!session) return <QuizFrame><EmptyState title="Rodada não disponível" message="Escolha uma categoria para começar uma nova demonstração."
    action={{ label: 'Categorias', onPress: () => router.replace('/quiz') }} /></QuizFrame>;
  if (session.phase === 'result') return <QuizFrame><Text style={styles.body}>Preparando resultado…</Text></QuizFrame>;
  const question = session.questions[session.index];
  const selected = session.answers[session.index]; const answered = selected !== null;
  const correct = selected === question.correctAnswer;
  return <>
    <QuizFrame onTab={exit} header={<QuizHeading title={session.category.label} emoji={session.category.emoji}
      gradientColors={session.category.gradientColors} subtitle={`Questão ${session.index + 1} de ${session.questions.length}`}
      action={<Pressable accessibilityRole="button" accessibilityLabel="Sair do quiz" onPress={() => exit()} style={styles.exit}>
        <AppIcon name="close" color={colors.surface} /></Pressable>}>
      <ProgressBar light value={Math.round(session.answers.filter(a => a !== null).length / session.questions.length * 100)} label="Perguntas respondidas" />
    </QuizHeading>}
      footer={answered ? <GradientButton label={session.index < session.questions.length - 1 ? 'Próxima pergunta' : 'Ver resultado'}
        icon="forward" gradientColors={session.category.gradientColors} onPress={() => update(session.id, { type: 'advance', questionId: question.id })} /> : undefined}>
      <QuizDemoNotice />
      <SurfaceCard>
        <Text accessible={false} style={styles.emoji}>{question.emoji}</Text>
        <Text accessibilityRole="header" style={styles.question}>{question.question}</Text>
        <View style={styles.options}>
          {question.options.map((option, index) => {
            const showCorrect = answered && index === question.correctAnswer;
            const showWrong = answered && selected === index && !showCorrect;
            return <Pressable key={option} accessibilityRole="button"
              accessibilityLabel={`${option}${showCorrect ? ', resposta correta' : showWrong ? ', sua resposta, incorreta' : ''}`}
              accessibilityState={{ disabled: answered, selected: selected === index }} disabled={answered}
              onPress={() => update(session.id, { type: 'answer', questionId: question.id, answer: index })}
              style={({ pressed }) => [styles.option, showCorrect && styles.correct, showWrong && styles.wrong, pressed && { opacity: 0.85 }]}>
              {showCorrect && <GradientSurface readable gradientColors={[colors.accent, colors.secondary]} style={[StyleSheet.absoluteFill, { borderRadius: radii.field }]} />}
              <Text style={[styles.optionText, (showCorrect || showWrong) && { color: colors.surface }]}>{option}</Text>
              {(showCorrect || showWrong) && <View style={styles.feedback}><AppIcon size={18} name={showCorrect ? 'check' : 'close'} color={colors.surface} />
                <Text style={styles.feedbackText}>{showCorrect ? 'Correta' : 'Sua resposta'}</Text></View>}
            </Pressable>;
          })}
        </View>
        {answered && <InlineNotice tone={correct ? 'success' : 'info'} message={`${correct ? 'Resposta correta.' : 'A resposta correta está destacada.'} ${question.explanation}`} />}
      </SurfaceCard>
    </QuizFrame>
    <ConfirmDialog visible={confirmExit} title="Sair do quiz?" message="As respostas desta rodada não serão contabilizadas."
      confirmLabel="Sair" cancelLabel="Continuar quiz" onCancel={() => { setConfirmExit(false); pending.current = null; }}
      onConfirm={() => { setLeaving(true); setConfirmExit(false); discard(session.id); pending.current?.(); pending.current = null; }} />
  </>;
}
const styles = StyleSheet.create({
  body: { ...type.body, color: colors.body }, exit: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radii.icon, backgroundColor: 'rgba(255,255,255,0.15)' },
  emoji: { fontSize: 36 }, question: { ...type.subtitle, color: colors.title, fontWeight: '700' }, options: { gap: spacing.md },
  option: { borderRadius: radii.field, overflow: 'hidden', borderWidth: 2, borderColor: '#D1D5DB', padding: spacing.lg, gap: spacing.sm,
    backgroundColor: colors.surface, minHeight: 56 }, optionText: { ...type.body, color: colors.body },
  correct: { borderColor: colors.accent }, wrong: { backgroundColor: colors.dangerText, borderColor: colors.dangerText },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, feedbackText: { ...type.caption, color: colors.surface, fontWeight: '700' },
});
