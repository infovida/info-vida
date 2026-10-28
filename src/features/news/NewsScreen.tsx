import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../../components/AppIcon';
import { CategoryChip } from '../../components/controls';
import { EmptyState } from '../../components/feedback';
import { GradientSurface } from '../../components/layout';
import type { Article, ArticlesRepository } from '../../services/contracts';
import { colors, layout, radii, spacing, type } from '../../theme/tokens';
import { ArticleCard } from './ArticleCard';
import { newsCategories, type NewsCategoryId } from './data/categories';
import { demoArticlesRepository } from './demoArticlesRepository';
import { DemoNotice, NewsHeader, NewsLoading } from './NewsComponents';
import { useAsyncResource } from '../../hooks/useAsyncResource';

export function NewsScreen({ repository = demoArticlesRepository }: { repository?: ArticlesRepository }) {
  const [category, setCategory] = useState<NewsCategoryId>('all');
  const list = useRef<FlatList<Article>>(null);
  const offset = useRef(0);
  const opening = useRef(false);
  const load = useCallback(() => repository.list({ categoryId: category }), [repository, category]);
  const { result, retry } = useAsyncResource(load);
  useFocusEffect(useCallback(() => { opening.current = false; list.current?.scrollToOffset({ offset: offset.current, animated: false }); }, []));
  const selectCategory = (next: NewsCategoryId) => {
    offset.current = 0;
    list.current?.scrollToOffset({ offset: 0, animated: false });
    setCategory(next);
  };
  const openArticle = (article: Article) => {
    if (opening.current) return;
    opening.current = true;
    router.push({ pathname: '/articles/[id]', params: { id: article.id } });
  };
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
    <NewsHeader onProfile={() => router.navigate('/profile')} />
    <FlatList ref={list} testID="news-list" data={result.status === 'ready' ? result.data : []}
      keyExtractor={article => article.id} contentContainerStyle={styles.list} scrollEventThrottle={100}
      onScroll={event => { offset.current = event.nativeEvent.contentOffset.y; }}
      onScrollEndDrag={event => { offset.current = event.nativeEvent.contentOffset.y; }}
      onMomentumScrollEnd={event => { offset.current = event.nativeEvent.contentOffset.y; }}
      ListHeaderComponent={<View style={styles.headerContent}>
        <DemoNotice />
        <Pressable accessibilityRole="button" accessibilityLabel="Aprenda com o Quiz"
          accessibilityHint="Explore perguntas de educação em saúde" onPress={() => router.navigate('/quiz')}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
          <GradientSurface tone="education" readable style={styles.promotion}>
            <View style={styles.promotionRow}><View style={styles.iconBox}><AppIcon name="trending" color={colors.surface} /></View>
              <View style={styles.flex}><Text style={styles.promotionTitle}>Aprenda com o Quiz</Text>
                <Text style={styles.promotionBody}>Explore perguntas de educação em saúde</Text></View></View>
            <View style={styles.promotionFooter}><Text style={styles.promotionBody}>Explorar temas</Text>
              <AppIcon name="forward" color={colors.surface} size={20} /></View>
          </GradientSurface>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {newsCategories.map(item => <CategoryChip key={item.id} label={item.label} icon={item.icon}
            selected={category === item.id} onPress={() => selectCategory(item.id)} />)}
        </ScrollView>
        <Text accessibilityRole="header" style={styles.heading}>Notícias de exemplo</Text>
      </View>}
      ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
      renderItem={({ item }) => <ArticleCard article={item} onOpen={() => openArticle(item)} />}
      ListEmptyComponent={result.status === 'loading' ? <NewsLoading label="Carregando exemplos…" />
        : result.status === 'error' ? <EmptyState title="Não foi possível carregar os exemplos"
          message="Tente novamente para visualizar os conteúdos de demonstração." action={{ label: 'Tentar novamente', onPress: retry }} />
          : <EmptyState title="Nenhum exemplo nesta categoria" message="Escolha outra categoria ou veja todos os exemplos."
            action={{ label: 'Ver todos', onPress: () => selectCategory('all') }} />}
    />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 },
  list: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: spacing.lg, paddingBottom: spacing.xxl },
  headerContent: { gap: spacing.lg, paddingBottom: spacing.lg }, heading: { ...type.subtitle, color: colors.title, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: spacing.sm }, promotion: { borderRadius: radii.card, overflow: 'hidden', padding: spacing.xl, gap: spacing.md },
  promotionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: { width: 48, height: 48, borderRadius: radii.field, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  promotionTitle: { ...type.subtitle, color: colors.surface }, promotionBody: { ...type.small, color: colors.surface },
  promotionFooter: { backgroundColor: 'rgba(255,255,255,0.15)', padding: spacing.md, borderRadius: radii.field,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});
