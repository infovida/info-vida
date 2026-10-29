# Guia de continuidade — InfoVida

Este é o ponto de partida para o próximo agente ou integrante da equipe antes de
implementar. Retrato da entrega dos PRDs 003–006 e do quiz demo 007–009, seguido
do alinhamento de patches do Expo. Consulte o código e o Git para mudanças posteriores;
os registros de validação descrevem execuções datadas, não o estado remoto em tempo real.

## 1. Leia antes de alterar

1. [README](../README.md): como rodar e o que já é utilizável.
2. [Índice de PRDs](prd/README.md): escolha o documento pelo pedido atual, leia o
   **Estado atual**, critérios de aceite e pendências. A pasta não significa que
   todos os fluxos do produto estão completos.
3. [CONTRIBUTING](../CONTRIBUTING.md): convenções de teste, rotas e contribuição.
4. [PRD-003 — sistema visual e contratos](prd/implementados/PRD-003-sistema-visual.md):
   cores, layout, acessibilidade e regras compartilhadas. Vários contratos são
   planejamento; conferir o código antes de assumir que o serviço existe.
5. PRD da tarefa e suas dependências; depois o registro correspondente em
   `docs/validation/`, a implementação atual e os testes dessa área.
6. Componente correspondente no Figma Make, se a exportação local estiver disponível.
   Use como referência visual e de fluxo; adapte ao nativo.

O [PRD-001](prd/implementados/PRD-001-consolidacao-infovida.md) registra o
levantamento histórico das bases/dependências; o
[PRD-002](prd/parcialmente-implementados/PRD-002-estabilizacao-base.md) explica a
estabilização. Leia-os ao trabalhar em arquitetura, CI ou dependências. Não tratar
conclusões antigas sobre PRs/checks como consulta atual ao GitHub.

## 2. Decisões e limites que precisam ser preservados

- Manter o projeto e o histórico Expo/React Native da equipe. O protótipo correto
  é **Figma Make**, não Prisma. Não substituir a base pelo projeto React/Vite web.
- App informativo; notícias por API em etapa futura. Por enquanto, exemplos locais
  explicitamente fictícios, sem credencial, backend ou promessa de notícia atual.
- Preservar cores, hierarquia, gradientes, cards e formatação do Figma Make,
  ajustando responsividade, safe area, navegação, teclado e acessibilidade nativos.
- Entrada como visitante já funciona. Não acrescentar autenticação obrigatória,
  backend, sincronização ou provedor de API como se estivessem aprovados.
- Quiz tem conteúdo demo sobre uso do app e leitura de informações. Não carregar
  as questões clínicas do rascunho como conteúdo revisado. Rodadas demo não geram
  XP, conquistas, sequência ou tentativas persistidas.
- Propostas de gamificação/persistência nos PRDs não são aprovações de produto nem
  serviços prontos. Histórico indisponível não pode virar estatística fictícia.
- Commit, push, PR, reviews/fechamento remoto, merge, build de distribuição e
  publicação exigem autorização no pedido/contexto atual. Trabalhar localmente
  e entregar uma alteração revisável não autoriza essas ações por si só.

## 3. Estado funcional e arquivos para continuar

| Área | O que existe | Onde começar | O que falta |
| --- | --- | --- | --- |
| Fundação | Tema, componentes e cinco abas | `src/theme/tokens.ts`, `src/components/`, `src/navigation/`, `app/_layout.tsx`, `app/(tabs)/_layout.tsx` | Revisão visual/TalkBack/fonte ampliada em aparelho; adapters de serviços |
| Entrada | Marca e acesso às abas como visitante | `src/features/onboarding/WelcomeScreen.tsx`, `app/index.tsx` | Revisão visual/acessibilidade; autenticação fora do escopo atual |
| Notícias | Seis artigos fictícios, filtros, detalhe e recuperação | `src/features/news/`, `app/articles/[id].tsx` | API, conteúdo editorial real e integração de leituras reais ao histórico |
| Quiz | Seis categorias, 18 perguntas demo, sorteio até cinco, resposta única, explicação, resultado e confirmação de saída | `src/features/quiz/`, `src/domain/quiz.ts`, `src/domain/quizSession.ts`, `app/quiz/` | Conteúdo de saúde revisado, tentativa real persistida e progresso unificado |
| Lembretes | Regras puras e testes; aba provisória | `src/domain/reminders.ts`, `tests/reminders.test.ts`, PRDs 010/011 | Lista, formulário, repositório, operações assíncronas e integração de agenda |
| Emergência | Aba provisória | `src/features/foundation/FoundationScreen.tsx`, PRD-012 | Contatos, discador e revisão editorial das orientações |
| Perfil/recompensas | Apresentação de visitante; regras de atividade e contratos | `src/domain/activity.ts`, `src/services/contracts.ts`, PRDs 013/014 | Histórico persistente, estatísticas reais, tela de recompensas e regras aprovadas |
| Notificações | Interface de repositório e especificação | `src/services/contracts.ts`, PRD-015 | Central interna, persistência e serviço de notificações nativas |

As rotas devem continuar pequenas. `FoundationScreen` atende somente as áreas
provisórias; substituir cada entrada pelo fluxo próprio ao implementá-lo, sem
reescrever as áreas que já funcionam. `useAsyncResource` compartilha carregamento,
erro e repetição; os repositórios demo atuais são concretos, os de progresso,
lembretes e notificações são apenas interfaces.

### Cuidados técnicos já encontrados

- Reutilizar `GradientSurface` e o recorte nos cantos arredondados. A camada
  interna de contraste já causou um quadrado em volta do chip selecionado;
  preservar `overflow: hidden` e a correção ao criar novos gradientes.
- `QuizSessionProvider` mantém até 20 sessões **em memória**; reinício perde dados.
  Não presumir que `QuizAttempt`/`ProgressRepository` já estão conectados.
- Sessões congelam perguntas/versão; IDs e reducer impedem respostas/avanços
  duplicados. Preservar confirmação para X, Voltar e troca de abas.
- Conferir a API instalada do Expo Router antes de alterar a proteção de saída.
  A versão usada oferece `usePreventRemove` com `repeat` e função retornada de
  desativação. Não substituir por snippets de versões antigas sem verificar.
- A barra compartilhada fica em `src/navigation/AppTabBar.tsx`; evitar duplicá-la
  ao abrir telas do Stack e preservar retorno à aba sem deixar rodadas abandonadas.
- Ícones são PNGs locais com SVG fonte e licença em `assets/icons/`; scripts Python
  de rasterização são opcionais, não fazem parte do install/runtime.

## 4. Como escolher a próxima implementação

O pedido atual do usuário define a tarefa. Não implementar todos os PRDs em lote
nem presumir que o próximo número está automaticamente autorizado.

Sem mudança de prioridade, a próxima área planejada é **Lembretes**, lendo juntos
[PRD-010](prd/nao-implementados/PRD-010-lembretes.md) e
[PRD-011](prd/nao-implementados/PRD-011-lembrete-formulario.md), além do PRD-003.
Leia `src/domain/reminders.ts`, seus testes e `ReminderRepository` antes de escolher
armazenamento ou criar campos. Lista e editor formam um fluxo de criação/edição;
uma lista com exemplos fixos não conclui esses PRDs.

Priorizar cadastro/edição/ações locais com persistência versionada e erros
recuperáveis. A escolha de storage é pendente; não presumir que AsyncStorage é
criptografado. Não apagar dados inválidos nem tratar falha de leitura como vazio.
Reutilizar o domínio para dias civis, recorrência, marcação/desfazer e serialização;
manter alterações concorrentes consistentes e bloquear salvamento duplicado.

Notificações podem ser incremento separado, explicitamente documentado. Se
ficarem pendentes, a tela não deve prometer avisos com app fechado. Permissão
negada não bloqueia cadastro. Agendamento real precisa de build/aparelho e
comprovação própria; abrir o app no Expo Go não comprova entrega em background.
Não sugerir medicamentos/doses nem copiar recomendações sobre dose esquecida.

Para retomar outra área:

- **Quiz real:** PRDs 007, 008 e 009, `quizSession.ts`, provider/repositório e testes
  `quiz-catalogue-session`/`quiz-flow`. Planejar persistência idempotente e conteúdo
  revisado; não gravar retroativamente as sessões demo como tentativas reais.
- **API de notícias:** PRDs 005/006, `ArticlesRepository`, repositório demo e
  `tests/news-*`. Definir provedor/contrato com o usuário e preservar estados de
  erro/vazio/filtros/retorno e distinção entre exemplo e conteúdo real.
- **Emergência:** PRD-012 e componente original; orientações exigem revisão editorial.
- **Perfil/recompensas:** PRDs 013/014, regras de atividade e histórico comum ao quiz;
  sem números fixos do protótipo nem XP inventado.
- **Notificações:** PRD-015 e contratos; separar central interna de entrega pelo SO.

## 5. Referência visual local e arquivos compartilhados

Quando presente, a exportação completa está em `../InfoVida_FigmaMake/`, pasta
irmã da raiz Git. Originais em `src/app/components/`: `Splash.tsx`, `Home.tsx`,
`ArticleDetail.tsx`, `Quiz.tsx`, `Reminders.tsx`, `Emergency.tsx`, `Profile.tsx`,
`Rewards.tsx` e `Notifications.tsx`. Estilos em `src/styles/`.

Essa pasta fica só no computador de origem; não é parte do clone nem dependência
de build. Se não existir, começar pelos PRDs, tokens e componentes já portados;
solicitar referência adicional somente quando for necessária à tarefa visual.
Não recriar o protótipo nem puxar dependências web para contornar sua ausência.

O repositório compartilha assets usados pelo app, licenças/atribuições e os
rascunhos extraídos em [docs/reference/figma-make](reference/figma-make/README.md).
Esses JSONs não são fonte editorial aprovada nem são carregados pelo runtime.
Manter a distinção entre referência de migração e conteúdo exibido ao público.

## 6. Dependências, validação e CI

Antes de mudar arquivos, conferir `git status --short`, branch e alterações
existentes. Este clone já foi publicado para o PR #8; não presumir que o PR ainda
está aberto, aprovado ou com checks verdes. Se isso importar à tarefa, consultar
GitHub no head atual e registrar o SHA e a execução analisados.

A falha inicial do PR #8 foi em Expo Doctor, não nos testes: três patches abaixo
dos esperados. O commit local `de9ab62` alinha `expo ~58.0.20`,
`expo-dev-client ~58.0.16` e `expo-router ~58.0.27`, com lockfile atualizado.
Ver [diagnóstico histórico](validation/PR-008-ci-diagnostico.md).
Isso prova a alteração no Git, não o resultado de um novo CI; verificar novamente.
A consulta posterior do head `9d449323` confirmou CI aprovado e APK compilado;
o E2E falhou na criação do AVD antes do Maestro. O ajuste de ferramentas/perfil
e seus limites estão no [registro do emulador](validation/PR-008-e2e-emulador.md).
Não rebaixar versões, excluir pacotes do Doctor nem pular checks para dar verde.
Majors de ESLint/TypeScript exigem migração própria; React/react-dom precisam
ser avaliados em conjunto com Expo/RN. Mudar `package.json` e lockfile juntos.

Com Node compatível com `package.json` (ver `.nvmrc` para referência da equipe),
instalar via `npm ci`. A demonstração não precisa de `.env`, API ou conta Expo.
Depois de mudanças funcionais, rodar os testes apropriados e a validação exigida:

```bash
npm run doctor
npm run validate
```

`validate` = lint + TypeScript + Jest/cobertura; **não inclui Doctor**. Doctor pode
precisar de rede para consultar compatibilidade. Cobertura global mínima de 70%.
Testes em `tests/`, nunca em `app/`; Router real em `tests/helpers/appRoutes.tsx`.
Regras puras usam Jest, telas/interações usam RNTL, jornadas nativas usam Maestro.

Para alterações que afetem empacotamento, exportar sem gerar arquivos no Git:

```bash
CI=1 EXPO_OFFLINE=1 npx expo export --platform android --platform web --output-dir /tmp/infovida-validacao-bundles --max-workers 2
```

Essa exportação comprova bundles, não APK, EAS ou comportamento Android.
`.maestro/smoke.yaml` precisa de app instalado com o ID configurado; não basta
rodar Expo Go. `.github/workflows/ci.yml` inclui Doctor; `e2e-android.yml` compila
e roda emulador/Maestro; `build.yml` solicita EAS manualmente. Não disparar builds
remotos/publicações sem autorização. Os identificadores ainda são `com.example.infovida`.

Última evidência documentada do escopo demo: 58 testes e bundles Android/web
aprovados. Isso é uma referência datada, não um número obrigatório de testes nem
comprovação das dependências de qualquer execução futura. Revisão visual,
TalkBack, fonte 200% e E2E em aparelho/build continuam sujeitos a validação.

## 7. Documentação ao concluir um incremento

- Atualizar **Estado atual** e pendências do PRD; movê-lo entre as três pastas
  somente quando o escopo entregue justificar a classificação.
- Atualizar [índice](prd/README.md), README e este guia quando mudar a arquitetura,
  execução ou situação funcional relevante. Corrigir links após mover arquivos.
- Registrar comandos/resultados e limites em `docs/validation/`, distinguindo
  testes locais, Doctor, bundles, build nativa, teste manual e CI remoto.
- Preservar registros antigos como históricos; adicionar o resultado novo com
  referência ao commit/execução. Não sobrescrever uma falha antiga como se não existisse.
- Informar claramente o que ficou fora do incremento. Uma tela com dados fictícios,
  um contrato TypeScript ou uma aba navegável não concluem persistência/integração.
- Entregar resumo revisável; só criar commit/push/PR quando autorizado.
