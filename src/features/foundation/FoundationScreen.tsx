import { EmptyState, InlineNotice } from '../../components/feedback';
import { BrandHeader, Screen } from '../../components/layout';

const sections = {
  emergency: { title: 'Emergências', subtitle: 'Informações para encontrar ajuda.', icon: 'emergency',
    heading: 'Contatos e orientações', message: 'Esta área está em preparação. Os contatos e conteúdos serão disponibilizados após revisão.' },
  profile: { title: 'Perfil', subtitle: 'Seu espaço no InfoVida.', icon: 'profile',
    heading: 'Bem-vindo, visitante', message: 'Explore o InfoVida. Seu progresso educativo aparecerá aqui quando as atividades estiverem disponíveis.' },
} as const;
export type FoundationSection = keyof typeof sections;

export function FoundationScreen({ section }: { section: FoundationSection }) {
  const config = sections[section];
  return <Screen header={<BrandHeader title={config.title} subtitle={config.subtitle} icon={config.icon}
    tone={section === 'emergency' ? 'emergency' : 'brand'} />}>
    <EmptyState title={config.heading} message={config.message} />
    <InlineNotice message="Em breve no InfoVida." />
  </Screen>;
}
