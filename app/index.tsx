import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';

import { WelcomeScreen } from '../src/features/onboarding/WelcomeScreen';

export default function Index() {
  useFocusEffect(useCallback(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, []));
  return <WelcomeScreen onStart={() => router.replace('/home')} />;
}
