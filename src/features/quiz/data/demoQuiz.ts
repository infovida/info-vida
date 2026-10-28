import type { QuizCategory, QuizQuestion } from '../../../domain/quiz';

/** Local UI examples; the clinical draft from Figma is not published here. */
export const demoQuizCategories: readonly QuizCategory[] = [
  {
    "id": "vacinacao",
    "label": "Vacinação",
    "emoji": "💉",
    "gradientColors": [
      "#1565C0",
      "#42A5F5"
    ],
    "questionIds": [
      "vacinacao-demo-1",
      "vacinacao-demo-2",
      "vacinacao-demo-3"
    ]
  },
  {
    "id": "nutricao",
    "label": "Nutrição",
    "emoji": "🥗",
    "gradientColors": [
      "#2E7D32",
      "#66BB6A"
    ],
    "questionIds": [
      "nutricao-demo-1",
      "nutricao-demo-2",
      "nutricao-demo-3"
    ]
  },
  {
    "id": "saude-mental",
    "label": "Saúde Mental",
    "emoji": "🧠",
    "gradientColors": [
      "#6A1B9A",
      "#AB47BC"
    ],
    "questionIds": [
      "saude-mental-demo-1",
      "saude-mental-demo-2",
      "saude-mental-demo-3"
    ]
  },
  {
    "id": "prevencao",
    "label": "Prevenção",
    "emoji": "🛡️",
    "gradientColors": [
      "#E65100",
      "#FFA726"
    ],
    "questionIds": [
      "prevencao-demo-1",
      "prevencao-demo-2",
      "prevencao-demo-3"
    ]
  },
  {
    "id": "exercicios",
    "label": "Exercícios",
    "emoji": "💪",
    "gradientColors": [
      "#0277BD",
      "#26C6DA"
    ],
    "questionIds": [
      "exercicios-demo-1",
      "exercicios-demo-2",
      "exercicios-demo-3"
    ]
  },
  {
    "id": "primeiros-socorros",
    "label": "Primeiros Socorros",
    "emoji": "🚑",
    "gradientColors": [
      "#B71C1C",
      "#EF5350"
    ],
    "questionIds": [
      "primeiros-socorros-demo-1",
      "primeiros-socorros-demo-2",
      "primeiros-socorros-demo-3"
    ]
  }
];

export const demoQuizQuestions: readonly QuizQuestion[] = [
  {
    "id": "vacinacao-demo-1",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Qual filtro reúne os exemplos sobre vacinação no InfoVida?",
    "options": [
      "Exercícios",
      "Vacinação",
      "Nutrição",
      "Infância"
    ],
    "correctAnswer": 1,
    "explanation": "O filtro Vacinação reúne os exemplos dessa categoria. Os textos atuais são fictícios.",
    "emoji": "💉"
  },
  {
    "id": "vacinacao-demo-2",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Onde aparece a origem de um artigo no InfoVida?",
    "options": [
      "Na indicação de fonte do artigo",
      "Na cor do celular",
      "Apenas no ícone da aba",
      "Não existe indicação de fonte"
    ],
    "correctAnswer": 0,
    "explanation": "A indicação de fonte acompanha o artigo. Nos exemplos atuais, ela identifica a Equipe InfoVida e o conteúdo fictício.",
    "emoji": "💉"
  },
  {
    "id": "vacinacao-demo-3",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Um exemplo fictício de encontro sobre vacinação informa uma campanha real?",
    "options": [
      "Sim, com data confirmada",
      "Não; é uma demonstração do aplicativo",
      "Sim, se tiver uma imagem",
      "Sim, se o título for curto"
    ],
    "correctAnswer": 1,
    "explanation": "O aviso de demonstração identifica um exemplo de navegação, sem campanha, data ou inscrição real.",
    "emoji": "💉"
  },
  {
    "id": "nutricao-demo-1",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Como visualizar apenas exemplos de Nutrição?",
    "options": [
      "Pelo filtro Nutrição",
      "Trocando o brilho da tela",
      "Fechando o aplicativo",
      "Pelo botão de emergência"
    ],
    "correctAnswer": 0,
    "explanation": "Selecionar Nutrição filtra a lista sem misturar exemplos de outras categorias.",
    "emoji": "🥗"
  },
  {
    "id": "nutricao-demo-2",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "A ilustração de um exemplo comprova que o evento aconteceu?",
    "options": [
      "Sim, qualquer desenho comprova",
      "Não, a ilustração não comprova um evento",
      "Sim, se a imagem for azul",
      "Sim, se houver um livro"
    ],
    "correctAnswer": 1,
    "explanation": "As ilustrações dos exemplos são locais e foram criadas para demonstrar o layout, não para documentar um evento real.",
    "emoji": "🥗"
  },
  {
    "id": "nutricao-demo-3",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "O exemplo de mostra sobre alimentação é um cardápio pessoal?",
    "options": [
      "Sim, para todos os usuários",
      "Não; é um texto fictício de apresentação",
      "Sim, de acordo com o avatar",
      "Sim, quando a capa aparece"
    ],
    "correctAnswer": 1,
    "explanation": "O exemplo não define dieta ou cardápio. Ele demonstra a categoria e a leitura de artigos.",
    "emoji": "🥗"
  },
  {
    "id": "saude-mental-demo-1",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Como ler o conteúdo completo de um card de Saúde Mental?",
    "options": [
      "Tocando no card",
      "Mudando o volume",
      "Fechando a aba",
      "Tocando no relógio do aparelho"
    ],
    "correctAnswer": 0,
    "explanation": "Tocar no card abre o artigo completo, com resumo, fonte e parágrafos.",
    "emoji": "🧠"
  },
  {
    "id": "saude-mental-demo-2",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "A roda de escuta dos exemplos oferece atendimento pelo aplicativo?",
    "options": [
      "Sim, automaticamente",
      "Não; o encontro descrito é fictício",
      "Sim, após tocar na imagem",
      "Sim, sem informar origem"
    ],
    "correctAnswer": 1,
    "explanation": "O artigo de demonstração não representa um serviço ou atendimento real.",
    "emoji": "🧠"
  },
  {
    "id": "saude-mental-demo-3",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Como voltar do artigo para a lista de exemplos?",
    "options": [
      "Pelo botão Voltar",
      "Apagando os dados",
      "Criando outra conta",
      "Alterando a senha"
    ],
    "correctAnswer": 0,
    "explanation": "Voltar retorna à lista e mantém a categoria escolhida.",
    "emoji": "🧠"
  },
  {
    "id": "prevencao-demo-1",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "O que o aviso de demonstração informa sobre as notícias atuais?",
    "options": [
      "Que são exemplos fictícios",
      "Que são alertas da sua região",
      "Que são eventos confirmados",
      "Que dispensam indicação de fonte"
    ],
    "correctAnswer": 0,
    "explanation": "O aviso deixa claro que os textos servem para visualizar o aplicativo, antes da integração com notícias reais.",
    "emoji": "🛡️"
  },
  {
    "id": "prevencao-demo-2",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Uma notícia compartilhada sem indicar sua origem merece qual atitude de leitura?",
    "options": [
      "Procurar a fonte antes de confiar no texto",
      "Confiar só no título",
      "Ignorar toda informação de origem",
      "Considerar a imagem como única prova"
    ],
    "correctAnswer": 0,
    "explanation": "Verificar de onde veio a informação ajuda a avaliar o conteúdo. O exemplo não substitui a consulta à fonte.",
    "emoji": "🛡️"
  },
  {
    "id": "prevencao-demo-3",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Abrir um exemplo de Prevenção concede XP nesta demonstração?",
    "options": [
      "Sim, a cada toque",
      "Não; leituras fictícias não geram progresso",
      "Sim, se houver capa",
      "Sim, após voltar"
    ],
    "correctAnswer": 1,
    "explanation": "Nesta fase, explorar exemplos não registra leitura nem concede pontos.",
    "emoji": "🛡️"
  },
  {
    "id": "exercicios-demo-1",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Onde encontrar o exemplo sobre movimento e lazer?",
    "options": [
      "No filtro Exercícios",
      "Na configuração de senha",
      "No volume do aparelho",
      "Na tela de bloqueio"
    ],
    "correctAnswer": 0,
    "explanation": "O exemplo pertence à categoria Exercícios e pode ser localizado pelo filtro correspondente.",
    "emoji": "💪"
  },
  {
    "id": "exercicios-demo-2",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "O encontro de movimento e lazer do feed tem inscrição real?",
    "options": [
      "Não; ele é fictício",
      "Sim, pelo avatar",
      "Sim, pela ilustração",
      "Sim, por esta alternativa"
    ],
    "correctAnswer": 0,
    "explanation": "O texto foi criado para testar o feed e não anuncia uma aula, programação ou inscrição.",
    "emoji": "💪"
  },
  {
    "id": "exercicios-demo-3",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Qual informação identifica estes resultados de quiz?",
    "options": [
      "Resultado de demonstração, sem progresso salvo",
      "Um certificado profissional",
      "Uma meta clínica",
      "Um atendimento agendado"
    ],
    "correctAnswer": 0,
    "explanation": "O resultado mostra apenas o desempenho desta rodada de exemplo, sem certificado ou registro de progresso.",
    "emoji": "💪"
  },
  {
    "id": "primeiros-socorros-demo-1",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "O quiz de demonstração ensina um procedimento de emergência?",
    "options": [
      "Não; estas perguntas testam leitura e navegação",
      "Sim, apenas pelo emoji",
      "Sim, pelo gradiente vermelho",
      "Sim, automaticamente"
    ],
    "correctAnswer": 0,
    "explanation": "O conteúdo desta rodada não apresenta procedimentos. Os textos de saúde do protótipo aguardam revisão.",
    "emoji": "🚑"
  },
  {
    "id": "primeiros-socorros-demo-2",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Qual informação distingue um exemplo de um serviço real?",
    "options": [
      "A indicação explícita de conteúdo fictício",
      "O tamanho do botão",
      "A cor do fundo",
      "O número de palavras do título"
    ],
    "correctAnswer": 0,
    "explanation": "A indicação de demonstração evita apresentar exemplos como serviços ou acontecimentos reais.",
    "emoji": "🚑"
  },
  {
    "id": "primeiros-socorros-demo-3",
    "contentVersion": "demo-v1",
    "isDemo": true,
    "question": "Ao sair de uma rodada já respondida, o que o app deve oferecer?",
    "options": [
      "Uma confirmação para continuar ou sair",
      "Uma ligação automática",
      "Um cadastro obrigatório",
      "Uma pontuação inventada"
    ],
    "correctAnswer": 0,
    "explanation": "A confirmação permite continuar a rodada ou descartá-la, sem gravar pontos nesta demonstração.",
    "emoji": "🚑"
  }
];
