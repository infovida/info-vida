import { useLocalSearchParams } from 'expo-router';

import { ArticleScreen } from '../../src/features/news/ArticleScreen';

export default function ArticleRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <ArticleScreen id={typeof id === 'string' ? id : ''} />;
}
