import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import type { Article } from '../../services/contracts';
import { cardShadow, colors, radii, spacing, type } from '../../theme/tokens';
import { ArticleCover, CategoryBadge } from './NewsComponents';

export function ArticleCard({ article, onOpen }: { article: Article; onOpen: () => void }) {
  const { fontScale } = useWindowDimensions();
  return <Pressable accessible accessibilityRole="button" accessibilityLabel={`Ler artigo: ${article.title}`}
    accessibilityHint="Abre um conteúdo fictício para demonstração" onPress={onOpen}
    style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
    {article.imageAsset && <ArticleCover key={article.imageAsset} asset={article.imageAsset} />}
    <View style={styles.content}>
      <View style={styles.meta}><CategoryBadge categoryId={article.categoryId} />
        <Text style={styles.metaText}>Exemplo fictício</Text></View>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.summary} numberOfLines={fontScale >= 1.5 ? undefined : 2}>{article.summary}</Text>
      <Text style={styles.metaText}>{article.sourceLabel}</Text>
      <View style={styles.more}><Text style={styles.link}>Ler mais</Text><AppIcon name="forward" size={16} /></View>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { ...cardShadow, backgroundColor: colors.surface, borderRadius: radii.card, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border },
  content: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  metaText: { ...type.caption, color: colors.muted }, title: { ...type.label, fontWeight: '700', color: colors.title },
  summary: { ...type.small, color: colors.muted }, more: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  link: { ...type.caption, fontWeight: '600', color: colors.primary },
});
