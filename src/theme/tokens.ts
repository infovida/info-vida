import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  background: '#F4F9FF', surface: '#FFFFFF', text: '#1A1A1A', title: '#1F2937',
  body: '#374151', muted: '#64748B', primary: '#1565C0', secondary: '#42A5F5',
  accent: '#26C6DA', softBlue: '#E3F2FD', border: 'rgba(21,101,192,0.08)',
  focus: '#1565C0', danger: '#EF4444', dangerText: '#B91C1C', dangerSoft: '#FEF2F2',
  success: '#15803D', successSoft: '#F0FDF4', warning: '#92400E', warningSoft: '#FFFBEB',
  orange: '#C2410C', orangeSoft: '#FFF7ED', activeTab: 'rgba(21,101,192,0.08)',
} as const;
export const gradients = {
  brand: ['#1565C0', '#42A5F5', '#26C6DA'],
  action: ['#1565C0', '#42A5F5'], education: ['#1565C0', '#26C6DA'],
  reminders: ['#1565C0', '#1976D2', '#42A5F5'],
  emergency: ['#EF4444', '#DC2626', '#B91C1C'],
} as const;
export type GradientName = keyof typeof gradients;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40, hero: 48 } as const;
export const radii = { icon: 12, field: 16, base: 20, card: 24, button: 32, brand: 40 } as const;
export const layout = { maxWidth: 672, minTouch: 48 } as const;
export const type = {
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
  small: { fontSize: 14, lineHeight: 21, fontWeight: '400' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  subtitle: { fontSize: 18, lineHeight: 25, fontWeight: '600' },
  section: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 31, fontWeight: '700' },
  display: { fontSize: 30, lineHeight: 38, fontWeight: '700' },
  brand: { fontSize: 36, lineHeight: 44, fontWeight: '700' },
  score: { fontSize: 48, lineHeight: 58, fontWeight: '700' },
} satisfies Record<string, TextStyle>;
export const cardShadow: ViewStyle = {
  shadowColor: '#153D68', shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
};
