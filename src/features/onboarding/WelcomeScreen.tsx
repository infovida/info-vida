import { useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '../../components/controls';
import { InlineNotice } from '../../components/feedback';
import { GradientSurface } from '../../components/layout';
import { cardShadow, colors, radii, spacing, type } from '../../theme/tokens';

/** Fallback keeps the institution name available even if an asset cannot load. */
function LocalLogo({ source, label, style }: { source: ImageSourcePropType; label: string; style: StyleProp<ImageStyle> }) {
  const [failed, setFailed] = useState(false);
  return failed ? <View style={[style, styles.logoFallback, { minHeight: StyleSheet.flatten(style)?.height }]}>
    <Text style={styles.logoFallbackText}>{label}</Text>
  </View> : <Image source={source} accessibilityLabel={label} accessibilityRole="image" accessible resizeMode="contain"
    style={style} onError={() => setFailed(true)} />;
}

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const { fontScale } = useWindowDimensions();
  const starting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const start = () => {
    if (starting.current) return;
    starting.current = true;
    setBusy(true);
    setError(undefined);
    try { onStart(); } catch {
      starting.current = false;
      setBusy(false);
      setError('Não foi possível abrir o InfoVida. Tente novamente.');
    }
  };
  return <GradientSurface readable style={styles.root}>
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.brandBox}>
              <LocalLogo source={require('../../../assets/figma-make/logo_pet__1_.png')}
                label="PET-TECHSUS — Transformação Digital no SUS" style={styles.brandLogo} />
            </View>
            <View style={styles.brandText}>
              <Text accessibilityRole="header" style={styles.name}>InfoVida</Text>
              <Text style={styles.slogan}>Sua saúde, nossa prioridade</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <GradientButton label="Começar" variant="secondary" size="large" onPress={start} loading={busy} />
            <Text style={styles.guestMessage}>Acesse os conteúdos sem criar conta</Text>
            {error && <InlineNotice tone="error" message={error} />}
            <View style={styles.institutions}>
              <View style={[styles.institution, fontScale >= 1.5 && styles.stackedInstitution]}>
                <Text style={styles.institutionLabel}>Desenvolvido por</Text>
                <View style={styles.institutionBox}>
                  <LocalLogo source={require('../../../assets/figma-make/Unifal.png')}
                    label="UNIFAL-MG" style={styles.institutionLogo} />
                </View>
              </View>
              <View style={[styles.institution, fontScale >= 1.5 && styles.stackedInstitution]}>
                <Text style={styles.institutionLabel}>Apoio</Text>
                <View style={styles.institutionBox}>
                  <LocalLogo source={require('../../../assets/figma-make/Captura_de_tela_2026-07-07_172314.png')}
                    label="Ministério da Saúde" style={styles.institutionLogo} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </GradientSurface>;
}
const styles = StyleSheet.create({
  root: { flex: 1 }, safeArea: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flexGrow: 1, padding: spacing.xxl, alignItems: 'center' },
  content: { width: '100%', maxWidth: 448, flexGrow: 1 },
  hero: { flexGrow: 1, flexShrink: 0, minHeight: 320, paddingVertical: spacing.xxxl,
    alignItems: 'center', justifyContent: 'center', gap: spacing.xxl },
  brandBox: { ...cardShadow, backgroundColor: colors.surface, borderRadius: radii.brand, padding: spacing.xl },
  brandLogo: { width: 112, height: 112 },
  brandText: { gap: spacing.sm, alignItems: 'center', alignSelf: 'stretch' },
  name: { ...type.brand, color: colors.surface, textAlign: 'center' },
  slogan: { ...type.subtitle, fontWeight: '400', color: colors.surface, textAlign: 'center' },
  footer: { gap: spacing.md }, guestMessage: { ...type.small, color: colors.surface, textAlign: 'center' },
  institutions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  institution: { flexGrow: 1, flexBasis: 128, gap: spacing.sm },
  stackedInstitution: { flexBasis: '100%' },
  institutionLabel: { ...type.caption, fontWeight: '600', color: colors.surface, textAlign: 'center' },
  institutionBox: { backgroundColor: colors.surface, borderRadius: radii.field,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center' },
  institutionLogo: { width: '100%', height: 40 },
  logoFallback: { height: 'auto', alignItems: 'center', justifyContent: 'center' },
  logoFallbackText: { ...type.caption, color: colors.primary, textAlign: 'center' },
});
