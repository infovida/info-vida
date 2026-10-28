import type { IconName } from '../../../components/AppIcon';

export const newsCategories = [
  { id: 'all', label: 'Todos', icon: 'health' },
  { id: 'vaccination', label: 'Vacinação', icon: 'vaccination' },
  { id: 'prevention', label: 'Prevenção', icon: 'prevention' },
  { id: 'mental-health', label: 'Saúde Mental', icon: 'quiz' },
  { id: 'misinformation', label: 'Fake News', icon: 'misinformation' },
  { id: 'nutrition', label: 'Nutrição', icon: 'nutrition' },
  { id: 'exercise', label: 'Exercícios', icon: 'exercise' },
  { id: 'emergency', label: 'Emergência', icon: 'emergency' },
  { id: 'childhood', label: 'Infância', icon: 'childhood' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type NewsCategoryId = typeof newsCategories[number]['id'];
export function categoryLabel(id: string): string {
  return newsCategories.find(category => category.id === id)?.label ?? 'Informação';
}
