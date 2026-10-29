import { useLocalSearchParams } from 'expo-router';

import { QuizResultScreen } from '../../../src/features/quiz/QuizResultScreen';

export default function QuizResultRoute() {
  const { attemptId } = useLocalSearchParams<{ attemptId?: string | string[] }>();
  return <QuizResultScreen attemptId={typeof attemptId === 'string' ? attemptId : ''} />;
}
