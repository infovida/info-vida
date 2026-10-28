import { router } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '../../components/controls';
import { EmptyState } from '../../components/feedback';
import type { ArticlesRepository } from '../../services/contracts';
import { colors, layout, spacing, type } from '../../theme/tokens';
import { demoArticlesRepository } from './demoArticlesRepository';
import { ArticleCover, CategoryBadge, DemoNotice, NewsLoading } from './NewsComponents';
import { useAsyncResource } from '../../hooks/useAsyncResource';

export function ArticleScreen({ id, repository = demoArticlesRepository }: { id: string; repository?: ArticlesRepository }) {
  const load = useCallback(() => id ? repository.getById(id) : Promise.resolve(null), [repository, id]);
  const { result, retry } = useAsyncResource(load);
  const article = result.status === 'ready' ? result.data : null;
  const back = () => { if (router.canGoBack()) router.back(); else router.replace('/home'); };
  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <IconButton icon="arrow" label="Voltar" onPress={back} />
      {article ? <CategoryBadge categoryId={article.categoryId} /> : <Text style={styles.subtitle}>Leitura</Text>}
    </View>
    <ScrollView contentContainerStyle={styles.scroll}>
      {result.status === 'loading' ? <View style={styles.body}><NewsLoading label="Carregando artigo…" /></View>
        : result.status === 'error' ? <View style={styles.body}><EmptyState title="Não foi possível carregar o artigo"
          message="O conteúdo de demonstração não pôde ser lido. Tente novamente."
          action={{ label: 'Tentar novamente', onPress: retry }} /></View>
          : !article ? <View style={styles.body}><EmptyState title="Artigo não encontrado"
            message="Este exemplo não está disponível no InfoVida." action={{ label: 'Voltar ao início', onPress: () => router.replace('/home') }} /></View>
            : <>
              {article.imageAsset && <ArticleCover key={article.imageAsset} asset={article.imageAsset} />}
              <View style={styles.body}>
                <DemoNotice detail />
                <Text accessibilityRole="header" style={styles.title}>{article.title}</Text>
                <Text style={styles.source}>{article.sourceLabel}</Text>
                <Text style={styles.metadata}>Exemplo fictício</Text>
                <Text style={styles.summary}>{article.summary}</Text>
                {article.body.map((paragraph, index) => <Text key={index} style={styles.paragraph}>{paragraph}</Text>)}
              </View>
            </>}
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, header: { width: '100%', maxWidth: layout.maxWidth,
    alignSelf: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, flexDirection: 'row',
    alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  scroll: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingBottom: spacing.xxl },
  body: { padding: spacing.xxl, gap: spacing.lg }, title: { ...type.title, color: colors.title },
  subtitle: { ...type.label, color: colors.primary }, source: { ...type.small, color: colors.primary, fontWeight: '500' },
  metadata: { ...type.small, color: colors.muted },
  summary: { ...type.body, color: colors.body, fontStyle: 'italic', borderLeftWidth: 4, borderLeftColor: colors.accent, paddingLeft: spacing.lg },
  paragraph: { ...type.body, color: colors.body },
});
