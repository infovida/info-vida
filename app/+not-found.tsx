import { router } from 'expo-router';

import { EmptyState } from '../src/components/feedback';
import { Screen } from '../src/components/layout';

export default function NotFoundScreen() {
  return <Screen>
    <EmptyState title="Página não encontrada" message="Este conteúdo ainda não está disponível no InfoVida."
      action={{ label: 'Voltar ao início', onPress: () => router.replace('/home') }} />
  </Screen>;
}
