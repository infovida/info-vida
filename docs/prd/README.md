# PRDs do InfoVida — estado de implementação

Versão 1.1 — 31/10/2026. PRDs 003–006 (fundação, entrada, feed e leitura) implementados
localmente; PRDs 007–009 parcialmente implementados em demonstração; PRDs 010–011 (lembretes e formulário CRUD com persistência local e agendamento de alertas) parcialmente implementados. Conferência visual no aparelho pendente.
Base executável: `InfoVida/`, Expo SDK 58, React Native, TypeScript e Expo Router.
Referência visual: `InfoVida_FigmaMake/`, exportação recebida pela equipe.

Antes de implementar, leia o [guia de continuidade](../CONTINUIDADE.md): ordem de leitura,
mapa do código, decisões e evidências de validação.

## Decisões confirmadas e propostas

**Confirmado por Ana:** app informativo; preservar identidade visual do Figma Make;
manter a base do time; notícias fictícias nesta etapa e API posteriormente;
sem commit, PR ou publicação sem autorização.

**Proposta de implementação destes PRDs:** visitante local sem login obrigatório;
cinco abas; persistência local de lembretes e progresso; regras de XP/nível e
conquistas detalhadas no contrato compartilhado. São decisões sugeridas para
preencher lacunas do protótipo, não aprovações de produto já obtidas.

Cada documento distingue o observado no protótipo do comportamento nativo
proposto. Dependências adicionais e caminhos descritos são planejados, salvo os
módulos de domínio já existentes. Não confundir estes PRDs com telas implementadas.

## Organização e estado atual

“Implementado” significa entregue no escopo indicado, sem declarar o produto inteiro concluído.
A revisão visual/acessibilidade em aparelho continua pendente. Os registros de validação
descrevem os limites; a existência de uma aba provisória não significa que seu PRD está implementado.

| Pasta / PRD | Entrega disponível | Trabalho restante |
| --- | --- | --- |
| [PRD-001 — Consolidação do InfoVida e avaliação de dependências](implementados/PRD-001-consolidacao-infovida.md) — implementados | Levantamento inicial das duas bases e dos PRs de dependências registrado. | As recomendações são históricas; aprovações, merges e atualizações dependem de nova revisão dos heads/checks. |
| [PRD-002 — Estabilização da base e extração do Figma Make](parcialmente-implementados/PRD-002-estabilizacao-base.md) — parcialmente-implementados | Configuração, dependências diretas, domínio e ajustes de CI preparados. | Lint, TypeScript, 58 testes e exportações Metro passaram na entrega mais recente. Instalação limpa passou no CI inicial do PR #8; Doctor apontou patches, alinhados no commit de9ab62. Ainda faltam confirmar os checks após esse ajuste, auditoria com rede e smoke Android; não considerar a falha original do E2E resolvida. |
| [PRD-003 — Sistema visual, navegação e contratos compartilhados](implementados/PRD-003-sistema-visual.md) — implementados | Tema, componentes e navegação entregues. | Contratos de persistência são interfaces, sem adapters prontos. Permanecem revisão visual, TalkBack, fonte ampliada e integração de histórico nas próximas funcionalidades. |
| [PRD-004 — Entrada e apresentação](implementados/PRD-004-entrada.md) — implementados | Entrada e acesso às abas entregues. | Revisão visual/acessibilidade em aparelho pendente; autenticação real não integra esta entrega. |
| [PRD-005 — Início e notícias de demonstração](implementados/PRD-005-inicio.md) — implementados | Feed, filtros, estados e navegação para leitura entregues. | API, fontes editoriais reais e revisão visual/acessibilidade permanecem pendentes; notícias reais não integram esta entrega. |
| [PRD-006 — Leitura de artigo](implementados/PRD-006-artigo.md) — implementados | Leitura, retorno ao feed e recuperação de identificadores inválidos entregues. | Integração com API/conteúdo editorial e revisão em aparelho permanecem pendentes. |
| [PRD-007 — Quiz: categorias e início](parcialmente-implementados/PRD-007-quiz-categorias.md) — parcialmente-implementados | Seis categorias, contagens derivadas, sorteio e criação de sessão entregues. | Faltam catálogo de saúde revisado e histórico persistente compartilhado com Perfil; sequência indisponível é indicada sem número fictício. |
| [PRD-008 — Quiz: sessão de perguntas](parcialmente-implementados/PRD-008-quiz-perguntas.md) — parcialmente-implementados | Respostas únicas, explicação, avanço e confirmação de saída entregues. | Faltam conteúdo de saúde revisado, persistência e contrato de tentativa real; demonstração fica apenas na memória. |
| [PRD-009 — Quiz: resultado](parcialmente-implementados/PRD-009-quiz-resultado.md) — parcialmente-implementados | Pontuação derivada, repetição e retorno entregues. | Faltam gravação idempotente de tentativa real, histórico e regras aprovadas de XP/conquistas; a demonstração não gera progresso. |
| [PRD-010 — Lembretes: lista, ações e exclusão](parcialmente-implementados/PRD-010-lembretes.md) — parcialmente-implementados | Lista funcional, contadores (`Total`, `Ativos`, `Tomados hoje`), mensagens iniciais, ações (`Tomei`/desfazer, ativar/pausar, editar, remover com confirmação), persistência local versionada e agendamento de notificações (30 min antes e na hora) entregues. | Faltam comprovação de alarmes em background em build nativa/aparelho Android, Maestro e revisão visual/TalkBack. |
| [PRD-011 — Formulário de criação e edição de lembrete](parcialmente-implementados/PRD-011-lembrete-formulario.md) — parcialmente-implementados | Formulário modal (`app/reminders/editor.tsx`), validação, atalhos de dias e horário, observações, proteção de descarte, persistência e integração de agendamento entregues. | Faltam conferência de teclado, TalkBack, `fontScale` 200% e execução Maestro em aparelho Android. |
| [PRD-012 — Emergência e acesso a contatos](nao-implementados/PRD-012-emergencia.md) — nao-implementados | A aba possui somente apresentação provisória. | Contatos, discador e orientações com revisão editorial ainda precisam ser implementados. |
| [PRD-013 — Perfil, atividade e informações do projeto](nao-implementados/PRD-013-perfil.md) — nao-implementados | Existe apresentação de visitante, sem histórico real conectado. | Estatísticas, edição e informações previstas no PRD continuam pendentes. |
| [PRD-014 — Recompensas, nível e conquistas](nao-implementados/PRD-014-recompensas.md) — nao-implementados | Tela, catálogo e integração com histórico ainda pendentes. | Regras de XP, nível e conquistas são propostas a confirmar. |
| [PRD-015 — Central de notificações dentro do app](nao-implementados/PRD-015-notificacoes.md) — nao-implementados | Central interna, armazenamento e integração com notificações ainda pendentes; não há serviço de notificações nativas implementado. | Consulte os limites do documento. |

A pasta `implementados/` contém a análise e as entregas 003–006 no escopo atual.
`parcialmente-implementados/` contém estabilização, quiz e lembretes (002, 007–011).
`nao-implementados/` contém os fluxos 012–015; alguns já têm domínio ou apresentação provisória.

## Índice e rastreabilidade

| Documento | Referência Figma Make | Destino nativo proposto |
| --- | --- | --- |
| [PRD-003 — Sistema visual e contratos](implementados/PRD-003-sistema-visual.md) | theme.css, BottomNav, StreakCalendar, App | src/theme, componentes e layouts |
| [PRD-004 — Entrada](implementados/PRD-004-entrada.md) | Splash.tsx | app/index.tsx |
| [PRD-005 — Início/notícias](implementados/PRD-005-inicio.md) | Home.tsx | app/(tabs)/home.tsx |
| [PRD-006 — Artigo](implementados/PRD-006-artigo.md) | ArticleDetail.tsx | app/articles/[id].tsx |
| [PRD-007 — Categorias do quiz](parcialmente-implementados/PRD-007-quiz-categorias.md) | Quiz.tsx: seleção | app/(tabs)/quiz.tsx |
| [PRD-008 — Perguntas do quiz](parcialmente-implementados/PRD-008-quiz-perguntas.md) | Quiz.tsx: pergunta | app/quiz/session.tsx |
| [PRD-009 — Resultado do quiz](parcialmente-implementados/PRD-009-quiz-resultado.md) | Quiz.tsx: resultado | app/quiz/result/[attemptId].tsx |
| [PRD-010 — Lembretes](parcialmente-implementados/PRD-010-lembretes.md) | Reminders.tsx: lista e exclusão | app/(tabs)/reminders.tsx |
| [PRD-011 — Formulário de lembrete](parcialmente-implementados/PRD-011-lembrete-formulario.md) | ReminderForm | app/reminders/editor.tsx |
| [PRD-012 — Emergência](nao-implementados/PRD-012-emergencia.md) | Emergency.tsx | app/(tabs)/emergency.tsx |
| [PRD-013 — Perfil](nao-implementados/PRD-013-perfil.md) | Profile.tsx | app/(tabs)/profile.tsx |
| [PRD-014 — Recompensas](nao-implementados/PRD-014-recompensas.md) | Rewards.tsx | app/rewards.tsx |
| [PRD-015 — Notificações](nao-implementados/PRD-015-notificacoes.md) | Notifications.tsx | app/notifications.tsx (modal) |

Calendário de sequência, barra inferior, mensagens, confirmações e cards são
componentes compartilhados, não novas abas. Entrar/Criar Conta, edição de perfil
e engrenagem aparecem no protótipo sem fluxo funcional completo: as decisões
para eles estão nos PRDs de Entrada e Perfil. Nenhum formulário de autenticação
foi inventado como requisito já confirmado.

## Prioridade e entrega

1. Concluir validação Expo da estabilização (PRD-002), criar tokens, componentes e navegação.
2. Entrada, aba Início com notícias fictícias e detalhe: primeira entrega visual no Android/Expo Go.
3. Categorias, sessão e resultado do quiz, com armazenamento de tentativas.
4. Lista/editor de lembretes, armazenamento e notificações locais em incremento próprio.
5. Perfil/recompensas alimentados por eventos; emergência com conteúdo revisado.
6. Central de notificações como complemento; API de notícias fica para fase posterior.

Meta observável: navegar e ler exemplos fictícios; concluir um quiz sem pontuação
incorreta; manter dados locais após reiniciar; reconhecer e operar as mesmas
áreas visuais do protótipo. Não há metas numéricas de retenção inventadas. Nenhuma
telemetria externa ou conta é necessária para avaliar esses fluxos no MVP.

## Aceite transversal e revisão

Cada PRD contém estados, regras, adaptação técnica, critérios e pendências.
O aceite exige critérios da tela **e** critérios comuns do PRD-003. Testes Jest
para regras, RNTL para interação/acessibilidade e Maestro para jornadas; preservar
70% de cobertura global e incluir src/. Evitar snapshots gigantes como única prova.

Revisão visual: capturar a exportação web e o app nativo no mesmo tamanho lógico
(390 × 844 como referência), comparar hierarquia, cores, espaços, proporções e
estados. Complementar com 360 × 800, 412 × 915, texto ampliado e aparelho real.
390 × 844 é viewport web de referência, não promessa de pixels físicos idênticos
entre plataformas. A análise atual foi do código: não houve comparação de screenshots.

Pendências globais: público/faixa etária, revisão editorial e uso de logos,
prioridade iOS, autenticação, sincronização, regras propostas de gamificação e
provedor de API. Não impedem desenhar o feed fictício e a estrutura de navegação.

## Progresso de implementação

PRD-003: tema, componentes, cinco abas, estados provisórios e contratos
implementados. Consulte o [registro de validação](../validation/PRD-003-validacao.md).
PRD-004: entrada e acesso às abas implementados. Consulte a
[validação da entrada](../validation/PRD-004-validacao.md).
PRDs 005/006: feed fictício e leitura implementados, com
[registro de validação](../validation/PRD-005-006-validacao.md).
PRD-007: categorias e início implementados em modo demo; PRDs 008/009: perguntas,
explicações e resultado demo implementados. Persistência, catálogo clínico revisado,
XP e progresso real continuam pendentes. Consulte a
[validação do quiz demo](../validation/PRD-007-009-demo-validacao.md).
PRDs 010/011: CRUD de lembretes, formulário modal, persistência local (`AsyncStorage` não criptografado) e agendamento de notificações locais (30 min antes e na hora) implementados; comprovação em build nativa/aparelho Android e Maestro permanecem pendentes. Consulte a
[validação de lembretes](../validation/PRD-010-011-validacao.md).
PRDs 012–015: especificados, ainda não implementados como fluxos completos.
