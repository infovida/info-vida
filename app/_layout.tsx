import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QuizSessionProvider } from '../src/features/quiz/QuizSessionProvider';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  return <SafeAreaProvider><QuizSessionProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  </QuizSessionProvider></SafeAreaProvider>;
}
