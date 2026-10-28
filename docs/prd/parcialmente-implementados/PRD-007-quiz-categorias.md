# PRD-007 — Quiz: categorias e início

**Estado atual:** Parcialmente implementado — categorias funcionais em demonstração.

Seis categorias, contagens derivadas, sorteio e criação de sessão entregues. Faltam catálogo de saúde revisado e histórico persistente compartilhado com Perfil; sequência indisponível é indicada sem número fictício.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P2, após feed.
Origem: seleção em `Quiz.tsx`; `app/(tabs)/quiz.tsx`, feature `quiz`.
Contratos: [PRD-003](../implementados/PRD-003-sistema-visual.md), [PRD-008](PRD-008-quiz-perguntas.md).

## Objetivo e composição

Escolher uma categoria educativa ou uma rodada aleatória. Header gradiente
azul/ciano, padding 24, ícone Brain em caixa 48 raio 16, título `Quiz InfoVida`
24/700 e apoio `Escolha uma categoria para começar` 14. Bloco translúcido de
sequência com chama e contagem real; visitante novo começa em 0, sem DAILY_STREAK=7.

Corpo com margem 20, espaço vertical 24. Card Quiz Aleatório em gradiente
azul/ciano, raio 24, padding 20, dado em caixa 64/16, título 20/700, apoio
`5 perguntas de todas as categorias`. Abaixo, texto `ou escolha uma categoria:`
e grid de duas colunas, gap 12; cards brancos raio 24/padding 20, ícone/emoji em
caixa 56/16, nome 16/700, quantidade 12. Com texto ampliado/tela insuficiente,
grid passa a uma coluna. Cinco abas, Quiz ativo.

Categorias da origem: Vacinação, Nutrição, Saúde Mental, Prevenção, Exercícios,
Primeiros Socorros. Cada uma tem 3 perguntas no material atual; contagem é derivada
do catálogo válido, não texto fixo. Gradientes individuais são preservados a
partir dos hexadecimais das categorias, convertidos para tokens nativos.

## Dados, interação e limites

Modelo proposto `QuizCategory {id, label, emoji, gradientColors, questionIds}`;
perguntas ganham `id` e `contentVersion` além do Question já portado. Importar
somente conteúdo revisado em `src/features/quiz/data/`, separado do JSON editorial.
Se provisoriamente usar conteúdo não validado para apresentação, mostrar
`Quiz de demonstração` e desligar gravação de XP/progresso para essa sessão.

Selecionar categoria inicia todas as questões válidas na ordem editorial. Modo
aleatório usa `selectQuestions` existente para sortear 5 únicas do conjunto
revisado; se houver menos, apoio mostra quantidade disponível e rodada usa essa
quantidade, desde que >0. Não repetir ID na mesma rodada. Não usar sort aleatório.
Desabilitar partida se conjunto vazio/inválido; não abrir sessão com zero perguntas.
Criar sessão e congelar conteúdo/versão antes de navegar; duplo toque não cria duas.

## Estados

Carregando catálogo; pronto com/sem atividade; categoria vazia desabilitada com
`Em preparação`; catálogo vazio global com mensagem e retorno ao Início; erro
com repetir. Dados de progresso indisponíveis mostram `Progresso indisponível`,
sem converter falha em sequência zero nem bloquear conteúdo educativo.
Catálogo local funciona offline. Ao voltar de sessão, não gerar nova partida.

## Implementação e testes

FlatList/grid responsivo ou lista finita; CategoryCard e StreakCalendar
compartilhados. Navegar para sessão do Stack com ID interno. Não persistir
estatísticas ao simples toque na categoria. Catálogo não muda no meio da rodada.
Jest para seleção; RNTL para cards/quantidades/vazio; Maestro categoria → sessão
→ sair → categorias.

## Critérios de aceite

- QC01: seis categorias previstas preservam rótulos, cores e hierarquia.
- QC02: contagens refletem dados; nenhum start produz sessão vazia.
- QC03: rodada aleatória tem até cinco IDs distintos do catálogo elegível.
- QC04: sequência não é fixa e corresponde ao mesmo histórico do Perfil.
- QC05: modo demo não gera progresso; modo revisado segue contrato de tentativa.
- QC06: cards e CTA permanecem legíveis em uma coluna quando necessário.

Pendentes: revisão editorial, catálogo aprovado e confirmação das regras de XP.


## Entrega local — demonstração

Categorias, sessão e resultado conectados em uma jornada utilizável, preservando
cores, cards, gradientes e hierarquia do Figma Make. Catálogo local com 18 perguntas
sobre uso do app e leitura de informações, identificadas como demonstração.
Sem gravação de tentativa, XP, conquistas ou sequência; sessões somente em memória.
O progresso indisponível é exibido como tal. Conteúdo de saúde revisado, integração
com histórico persistente e regras de gamificação permanecem pendentes.
Evidências e limites no [registro de validação](../../validation/PRD-007-009-demo-validacao.md).
