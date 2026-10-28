import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { colors, radii, spacing, type } from '../../theme/tokens';
import { categoryLabel } from './data/categories';

const covers = { community: require('../../../assets/news/community.png'), reading: require('../../../assets/news/reading.png') } as const;

export function ArticleCover({ asset }: { asset: string }) {
  const [failed, setFailed] = useState(false);
  const source = Object.hasOwn(covers, asset) ? covers[asset as keyof typeof covers] : undefined;
  return source && !failed ? <Image source={source} accessible accessibilityRole="image"
    accessibilityLabel="Ilustração de demonstração" resizeMode="cover" style={styles.cover} onError={() => setFailed(true)} />
    : <View style={[styles.cover, styles.fallback]}>
      <AppIcon name="info" color={colors.muted} />
      <Text style={[type.small, { color: colors.muted }]}>Imagem indisponível</Text>
    </View>;
}
export function CategoryBadge({ categoryId }: { categoryId: string }) {
  return <View style={styles.badge}><Text style={styles.badgeText}>{categoryLabel(categoryId)}</Text></View>;
}
export function DemoNotice({ detail = false }: { detail?: boolean }) {
  return <View style={styles.notice}>
    <AppIcon name="info" size={20} />
    <View style={styles.flex}>
      <Text style={styles.noticeTitle}>{detail ? 'Conteúdo fictício para demonstração' : 'Demonstração — notícias fictícias'}</Text>
      <Text style={styles.noticeBody}>Exemplos para visualizar o aplicativo. A integração com notícias reais será feita depois.</Text>
    </View>
  </View>;
}
export function NewsLoading({ label }: { label: string }) {
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{ busy: true }} style={styles.loading}>
    <Text style={[type.body, { color: colors.muted }]}>{label}</Text>
    <View style={[styles.skeleton, { height: 140 }]} />
    <View style={[styles.skeleton, { height: 16, width: '80%' }]} />
    <View style={[styles.skeleton, { height: 16, width: '60%' }]} />
  </View>;
}
export function NewsHeader({ onProfile }: { onProfile: () => void }) {
  const [failed, setFailed] = useState(false);
  const [focused, setFocused] = useState(false);
  return <View style={styles.header}>
    {!failed && <Image source={require('../../../assets/figma-make/logo_pet__1_.png')}
      accessible accessibilityRole="image" accessibilityLabel="PET-TECHSUS" resizeMode="contain"
      style={styles.logo} onError={() => setFailed(true)} />}
    <Text accessibilityRole="header" style={styles.brand}>InfoVida</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={onProfile}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.profile, { opacity: pressed ? 0.7 : 1 }, focused && styles.focus]}>
      <View style={styles.avatar}><AppIcon name="profile" size={20} color={colors.surface} /></View>
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 }, cover: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.softBlue },
  fallback: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  badge: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    backgroundColor: colors.softBlue, borderWidth: 1, borderColor: colors.border },
  badgeText: { ...type.caption, fontWeight: '600', color: colors.primary },
  notice: { padding: spacing.lg, backgroundColor: colors.softBlue, borderRadius: radii.field, flexDirection: 'row', gap: spacing.sm },
  noticeTitle: { ...type.small, fontWeight: '700', color: colors.primary },
  noticeBody: { ...type.small, color: colors.body, marginTop: spacing.xs },
  loading: { backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.xl, gap: spacing.md },
  skeleton: { backgroundColor: colors.softBlue, borderRadius: radii.icon },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border, width: '100%', maxWidth: 672, alignSelf: 'center' },
  logo: { width: 56, height: 56 }, brand: { ...type.title, color: colors.primary, flex: 1 },
  profile: { width: 48, minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  focus: { outlineWidth: 2, outlineColor: colors.focus },
});
