import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QuizSessionProvider } from '../src/features/quiz/QuizSessionProvider';
import { RemindersProvider } from '../src/features/reminders/RemindersProvider';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  return <SafeAreaProvider><QuizSessionProvider><RemindersProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="reminders/editor" options={{ presentation: 'modal' }} />
    </Stack>
  </RemindersProvider></QuizSessionProvider></SafeAreaProvider>;
}
