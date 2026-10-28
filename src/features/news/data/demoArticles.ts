import type { Article } from '../../../services/contracts';

export const DEMO_SOURCE = 'Equipe InfoVida — conteúdo fictício';
export const demoArticles: readonly Article[] = [
  {
    id: 'encontro-educacao-saude', categoryId: 'prevention',
    title: 'Exemplo: encontro de educação em saúde',
    summary: 'Um encontro imaginário reúne a comunidade para conversar sobre informação e cuidado no dia a dia.',
    imageAsset: 'community', sourceLabel: DEMO_SOURCE, isDemo: true,
    body: [
      'Este é um conteúdo fictício, criado apenas para demonstrar a leitura de notícias no InfoVida. O encontro descrito não está acontecendo e não tem data ou local de inscrição.',
      'No exemplo, uma comunidade organiza uma roda de conversa para conhecer diferentes temas de educação em saúde. O formato permite visualizar como o aplicativo apresentará título, categoria, resumo e texto completo.',
      'Quando a integração com notícias reais estiver disponível, os conteúdos terão sua origem identificada. Este exemplo não anuncia uma atividade de uma instituição e não substitui orientação profissional.',
    ],
  },
  {
    id: 'oficina-leitura-informacoes', categoryId: 'misinformation',
    title: 'Exemplo: oficina de leitura de informações de saúde',
    summary: 'Uma oficina fictícia apresenta diferentes formatos de informação em uma atividade de leitura e conversa.',
    imageAsset: 'reading', sourceLabel: DEMO_SOURCE, isDemo: true,
    body: [
      'A oficina desta notícia é imaginária. O texto foi preparado para demonstrar uma segunda categoria e a apresentação de um artigo com ilustração local.',
      'Na atividade fictícia, os participantes observam títulos, imagens e fontes de diferentes materiais educativos. Não se trata de uma campanha real nem de uma checagem de uma notícia específica.',
      'As notícias reais dependerão da futura integração com uma API. Até lá, os exemplos permanecerão identificados como fictícios no feed e na leitura completa.',
    ],
  },
  {
    id: 'conversa-vacinacao', categoryId: 'vaccination',
    title: 'Exemplo: conversa sobre materiais de vacinação',
    summary: 'Uma atividade imaginária mostra como textos sobre vacinação poderão ser organizados por categoria.',
    sourceLabel: DEMO_SOURCE, isDemo: true,
    body: [
      'Este exemplo é fictício e não anuncia campanha, calendário de vacinação ou atendimento. Seu objetivo é demonstrar a categoria Vacinação no aplicativo.',
      'O encontro imaginário teria uma mesa de leitura com diferentes materiais educativos. Aqui é possível conferir a organização de um artigo sem imagem de capa.',
      'Datas, público e orientações de campanhas reais não são definidos por este texto de demonstração.',
    ],
  },
  {
    id: 'roda-escuta-comunidade', categoryId: 'mental-health',
    title: 'Exemplo: roda de escuta na comunidade',
    summary: 'Uma proposta fictícia de encontro ilustra o espaço de notícias sobre saúde mental.',
    sourceLabel: DEMO_SOURCE, isDemo: true,
    body: [
      'A roda de escuta descrita aqui não é um serviço real. Trata-se de um exemplo de conteúdo para visualizar a seção de saúde mental.',
      'No cenário imaginário, moradores compartilham ideias para um encontro comunitário de conversa. Não há inscrição, atendimento ou encaminhamento por este artigo.',
      'O InfoVida exibirá a origem dos conteúdos reais quando essa etapa de integração for implementada.',
    ],
  },
  {
    id: 'mostra-materiais-nutricao', categoryId: 'nutrition',
    title: 'Exemplo: mostra de materiais sobre alimentação',
    summary: 'Uma mostra imaginária apresenta a organização de conteúdos educativos da categoria Nutrição.',
    imageAsset: 'reading', sourceLabel: DEMO_SOURCE, isDemo: true,
    body: [
      'Esta mostra é fictícia e serve para testar o filtro de notícias de Nutrição. Não há evento, cardápio ou recomendação alimentar sendo divulgado.',
      'A ilustração local representa materiais de leitura. Ela foi criada para o exemplo e não é uma fotografia de um encontro real.',
      'O texto demonstra a apresentação de parágrafos e metadados no aplicativo, sem sugerir dieta ou tratamento.',
    ],
  },
  {
    id: 'encontro-movimento-lazer', categoryId: 'exercise',
    title: 'Exemplo: encontro sobre movimento e lazer',
    summary: 'Um encontro fictício demonstra como a categoria Exercícios aparecerá na lista de notícias.',
    sourceLabel: DEMO_SOURCE, isDemo: true,
    body: [
      'Este conteúdo é fictício. Não existe programação, aula ou inscrição vinculada ao encontro apresentado como exemplo.',
      'A proposta imaginária reúne temas de movimento e lazer em uma conversa educativa. Não há indicação de exercícios, intensidade ou frequência.',
      'O artigo conclui o conjunto de exemplos de navegação; sua leitura não gera pontos, conquistas ou estatísticas pessoais.',
    ],
  },
];
