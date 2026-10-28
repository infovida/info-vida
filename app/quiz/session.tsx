import { useLocalSearchParams } from 'expo-router';

import { QuizSessionScreen } from '../../src/features/quiz/QuizSessionScreen';

export default function QuizSessionRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string | string[] }>();
  return <QuizSessionScreen sessionId={typeof sessionId === 'string' ? sessionId : ''} />;
}
