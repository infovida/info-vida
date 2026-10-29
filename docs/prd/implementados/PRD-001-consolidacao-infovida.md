# PRD-001 — Consolidação do InfoVida e avaliação de dependências

**Estado atual:** Implementado — análise documentada. Não representa decisões remotas executadas.

Levantamento inicial das duas bases e dos PRs de dependências registrado. As recomendações são históricas; aprovações, merges e atualizações dependem de nova revisão dos heads/checks.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Data: 27/10/2026. Estado original: análise. Estabilização local iniciada posteriormente; consulte [PRD-002](../parcialmente-implementados/PRD-002-estabilizacao-base.md).

Localização atual: a base originalmente chamada `InfoVida_github` passou a se chamar `InfoVida`, mantendo seu `.git`. O protótipo se chama `InfoVida_FigmaMake`. Os nomes históricos da base abaixo descrevem o levantamento inicial.
Responsáveis por decisões de produto e aprovação: Ana e equipe InfoVida.

## 1. Objetivo e limites desta etapa

Manter o trabalho da equipe no repositório `infovida/info-vida`, aproveitar o protótipo exportado e chegar futuramente a uma única pasta de desenvolvimento. Nesta etapa foram feitas leitura do código, consulta autenticada ao GitHub, inspeção de diffs e verificações, e escrita desta documentação local. Nenhum commit, push, PR, review, merge, fechamento ou alteração remota foi realizado. As duas pastas foram preservadas; o build web gerou/atualizou arquivos derivados em `InfoVida_FigmaMake/dist/`.

O nome efetivamente encontrado é `InfoVida_github`. A pasta chamada `InfoVida_FigmaMake` contém uma exportação do **Figma Make**, identificada pelo README, nome do pacote e componentes `figma`. Não foi encontrada implementação de backend ou ORM. O protótipo não determina a tecnologia de banco.

## 2. Evidências e estado das bases

A cópia Git local está limpa e no commit `d99a128d8d6542a5fbe26faacb2b70c0e8b00255`. A referência remota `main`, consultada pelo conector GitHub, aponta ao mesmo commit, de 25/10/2026. Repositório público: https://github.com/infovida/info-vida. O conector indica acesso de colaboradora com push, sem admin/maintain. Proteções de branch e presença de secrets não foram verificadas.

| Aspecto | Base da equipe | Protótipo |
| --- | --- | --- |
| Plataforma | Expo SDK 58, React Native 0.88, Expo Router | React 18, Vite 6, HTML/CSS, Tailwind 4, React Router |
| Produto implementado | Uma tela inicial de preparação do ambiente | Entrada, início/artigos, quiz, lembretes, emergência, perfil e recompensas |
| Navegação | Stack do Expo Router | BrowserRouter e navegação inferior |
| Persistência | Sem implementação de produto | Lembretes no localStorage versionado |
| Autenticação/backend | Não encontrados | Não encontrados; entrar/criar conta apenas navegam ao início |
| Qualidade | ESLint, TypeScript, Jest, cobertura mínima 70%, Maestro e Actions configurados | 9 testes unitários de lembretes e 5 cenários Playwright definidos |
| Distribuição | EAS configurado; IDs ainda `com.example.infovida` | Build estático web; não gera APK/iOS |

Arquivos principais da equipe: `app/index.tsx`, `app/_layout.tsx`, `package.json`, `app.json`, `eas.json`, `jest.config.js`, `.maestro/smoke.yaml`, `.github/workflows/`, `CONTRIBUTING.md`.
Arquivos principais do protótipo: `src/app/App.tsx`, `src/app/components/`, `src/app/lib/reminders.ts`, `src/app/context/RemindersContext.tsx`, `src/styles/`, `src/imports/`, `tests/`, `ATTRIBUTIONS.md`.

## 3. Decisão arquitetural proposta

Adotar o repositório da equipe como base definitiva, mantendo seu histórico, Expo Router, TypeScript e verificações. Portar progressivamente o produto do protótipo para React Native. Não substituir o package.json/lockfile da equipe pelo do protótipo nem copiar o conjunto de bibliotecas web.

A interface atual usa `div`, `button`, classes Tailwind, APIs DOM e animações web. Exige adaptação para View, Text, Pressable, ScrollView/FlatList, estilos nativos e recursos compatíveis com Expo. React compartilhado não torna essas telas diretamente portáveis.

Capacitor é uma alternativa citada no README do protótipo, mas adotá-lo agora mudaria a base escolhida pela equipe. Não é o caminho recomendado sob a restrição de preservar Expo. Nenhum backend, provedor de autenticação ou banco é escolhido neste PRD.

## 4. Matriz de reaproveitamento

| Origem | Aproveitar | Trabalho necessário |
| --- | --- | --- |
| `lib/reminders.ts` | Tipo Reminder, validação, datas locais, recorrência, codificação versionada e regras de ocorrência | Portar funções puras; validar geração de ID com API compatível com Expo; ampliar testes de fuso e mudanças de agenda |
| `tests/reminders.test.ts` | Casos de comportamento e fixtures | Adaptar de node:test para Jest, preservando casos úteis |
| `RemindersContext.tsx` | Contrato conceitual de operações e tratamento de erros | Reimplementar persistência assíncrona e notificações; remover window/document/localStorage/Notification e polling como estratégia nativa |
| `Reminders.tsx` | Campos, mensagens, edição, pausa, exclusão confirmada e registro diário | Construir formulário e diálogos nativos; coordenar alterações com cancelamento/reagendamento |
| `Home.tsx` / `ArticleDetail.tsx` | Hierarquia, categorias, cards e leitura | Extrair modelos/dados; portar tela; validar fontes e conteúdo antes de publicar |
| `Quiz.tsx` | Perguntas, categorias, explicações e fluxo | Extrair domínio; persistir tentativas; trocar embaralhamento por algoritmo apropriado e testável |
| `BottomNav.tsx` / `App.tsx` | Mapa de destinos | Converter para rotas/tabs do Expo Router com retorno nativo |
| `Emergency.tsx` | Estrutura de contatos e expansão de orientações | Usar Linking para abrir discador; conteúdo depende de revisão editorial responsável |
| `Profile.tsx` / `Rewards.tsx` / `StreakCalendar.tsx` | Referência visual e conceitos de progresso | Substituir números e conquistas fixos por eventos persistidos e regras consistentes |
| `Notifications.tsx` | Referência visual de lista | Itens são estáticos; não equivalem ao sistema de notificações reais |
| `Splash.tsx` | Marca e apresentação | Decidir entrada como visitante; login/cadastro reais exigem escopo próprio |
| `src/imports/` e estilos | Imagens selecionadas, cores, espaçamentos e tipografia | Verificar direitos/uso institucional, otimizar PNGs e criar tokens nativos |
| `components/ui/` | Referência de comportamento quando relevante | Não importar biblioteca shadcn/Radix web para React Native |
| Playwright | Jornadas como especificação | Reescrever jornadas móveis em Maestro e componentes em RNTL |

Não migrar node_modules, dist, caches, dependências não utilizadas, credenciais nem configurações de execução web. Preservar atribuições aplicáveis; o protótipo declara shadcn/ui MIT e fotos Unsplash. Isso não comprova permissão para todos os logos institucionais.

## 5. Lacunas funcionais observadas

- Perfil contém XP 2150 e estatísticas fixas de quizzes, dias e leituras. Recompensas contêm nível 11, XP e medalhas fixos. `DAILY_STREAK = 7` no quiz; calendário infere marcações a partir de um número, sem histórico de atividade.
- O quiz calcula pontuação em estado local; não há vínculo persistente entre resultados, perfil e recompensas. `sort(() => Math.random() - 0.5)` não garante sorteio uniforme.
- Artigos são objetos embutidos no código, incluindo notícias com expressões temporais. Um texto `source` não comprova publicação nem atualidade. Este levantamento não validou afirmações médicas, notícias ou orientações de primeiros socorros.
- Lembretes têm armazenamento e operações reais no navegador. Um registro contém um horário e apenas a última data marcada como tomado: não é prescrição, histórico completo de doses ou comprovação de adesão.
- Avisos dependem de aplicação/aba ativa; não há execução garantida em segundo plano. A notificação externa usa texto genérico, sem nome/dose, comportamento a preservar.
- localStorage não migra automaticamente ao aplicativo nativo. Para dados de usuários futuros, qualquer importação exigirá formato e fluxo explícitos; não introduzir importação nesta fase apenas para carregar dados de demonstração.
- Não foram encontradas conta real, sincronização, painel editorial, política de retenção ou fluxo de exclusão de dados implementados.

## 6. Diagnóstico do GitHub

Foram encontrados sete PRs abertos, todos do Dependabot, com diffs revisados. Todos aparecem como mescláveis, mas os dois workflows associados a cada um terminaram em falha. Mesclável significa ausência de conflito Git; não significa qualidade aprovada. O endpoint de status clássico retornou lista vazia: os resultados abaixo vieram de GitHub Actions, não de uma conclusão de ausência de checks.

### Problemas concretos antes de integrar funcionalidades

No [CI do PR 1](https://github.com/infovida/info-vida/actions/runs/40246926808), instalação passa, mas Expo Doctor passa em 18/20 verificações e falha em:

1. `app.json`: `newArchEnabled` não é aceito pelo schema consultado nessa execução.
2. `expo-constants` e `expo-linking` faltam como dependências diretas requeridas por expo-router.

O código local contém esse campo e não declara esses pacotes diretamente. Corrigir esses problemas preservando o SDK escolhido, executar `npx expo install expo-constants expo-linking`, revisar a configuração para o SDK instalado e atualizar o lockfile de forma controlada. Esses comandos são plano futuro, não foram executados nesta análise.

No [E2E do PR 1](https://github.com/infovida/info-vida/actions/runs/40246926823), o build Android e a instalação do APK passam. O emulador leva vários minutos para iniciar; Maestro encerra o smoke com código 1. O log consultado não identifica a causa funcional exata. Inspecionar o artefato de depuração antes de atribuir o problema a uma tela ou dependência. Considerar virtualização/KVM e configuração do emulador como hipóteses, não diagnósticos confirmados.

O log de instalação do PR 1 também reporta cinco vulnerabilidades de severidade alta. É uma evidência daquela execução em 25/10, não uma auditoria atual com pacotes/CVEs identificados. Fazer npm audit dedicado e tratar dependências afetadas sem aplicar `audit fix --force` indiscriminadamente.

### Recomendações por PR — nenhuma decisão remota executada

| PR | Alteração | Evidência | Recomendação |
| --- | --- | --- | --- |
| [1](https://github.com/infovida/info-vida/pull/1) | setup-node 5 → 7 | A action passa; CI para no Doctor, E2E no emulador/fluxo | Candidato a aprovar depois de corrigir base, atualizar branch e obter CI/E2E verdes |
| [2](https://github.com/infovida/info-vida/pull/2) | checkout 5 → 7 | Checkout passa; mesmos estágios posteriores falham | Candidato a aprovar sob as mesmas condições; workflows atuais usam pull_request, não pull_request_target |
| [3](https://github.com/infovida/info-vida/pull/3) | upload-artifact 4 → 7 | Etapas de upload passam; CI/E2E falham antes | Priorizar atualização após base estável; log da action v4 alerta sobre runtime Node 20 depreciado. Confirmar artefatos reais, pois etapa bem-sucedida pode não ter arquivos |
| [4](https://github.com/infovida/info-vida/pull/4) | ESLint 9.39.5 → 10.13 | CI não chega ao lint; lockfile da base declara eslint-plugin-react 7.37.5 com peer até ESLint 9 | Adiar major isolada; conferir árvore final do PR e suporte de todos os plugins, rodar lint e manter migração separada. Não há falha de lint comprovada |
| [5](https://github.com/infovida/info-vida/pull/5) | React 19.3.0 → 19.3.1 | Instalação passa; Doctor falha e testes não executam | Tratar junto ao react-dom em atualização coordenada compatível com Expo; validar Android e web |
| [6](https://github.com/infovida/info-vida/pull/6) | TypeScript 6.0.3 → 7.0.2 | Diff mantém ferramentas @typescript-eslint com peer `>=4.8.4 <6.1.0`; acrescenta instalações de TS 6 | Recomendar rejeitar o upgrade isolado atual e planejar migração quando toolchain suportar TS 7. Fechamento depende de autorização |
| [7](https://github.com/infovida/info-vida/pull/7) | react-dom 19.3.0 → 19.3.1 | npm ci falha nos dois workflows: react-dom exige React ^19.3.1, raiz mantém 19.3.0 | Não mesclar como está; substituir por atualização conjunta com PR 5 e novo lockfile |

Não aprovar nenhum PR imediatamente. As três Actions são candidatas, não atualizações integralmente validadas. Reavaliar cada head e checks após mudanças, porque este documento é uma fotografia.

### Política proposta para Dependabot

Agrupar React/react-dom; revisar conjunto Expo/React Native conforme compatibilidade do SDK; manter majors de TypeScript/ESLint em trabalhos separados. Preferir grupos de atualizações menores compatíveis e limitar PRs abertos. Não habilitar automerge nesta etapa. Fixar versões de ferramentas usadas no CI que hoje são baixadas dinamicamente, quando adequado. Confirmar com administrador proteção de main e checks obrigatórios; README recomenda proteção, mas não comprova configuração real.

## 7. Requisitos propostos do produto consolidado

Público específico, faixa etária e instituições participantes ainda precisam ser confirmados; a proposta parte dos fluxos observados de educação em saúde, quiz e lembretes pessoais.

| ID | Requisito | Critério observável de aceite |
| --- | --- | --- |
| RF01 | Navegação nativa pelos módulos aprovados | Usuário alterna destinos e volta sem erro; lembretes persistem ao navegar e reiniciar |
| RF02 | Conteúdo educativo por categoria e detalhe | Filtragem funciona; artigos têm origem rastreável, revisão e data quando publicados |
| RF03 | Quiz por categoria e aleatório | Resposta é contada uma vez; resultado correto; sair/recomeçar tem comportamento definido |
| RF04 | Cadastro/edição/pausa/exclusão de lembretes | Nome e horário validados; exclusão confirmada; falha de gravação não informa sucesso |
| RF05 | Persistência robusta | Dados inválidos são preservados e erro exibido; operação assíncrona não sobrescreve silenciosamente alterações concorrentes |
| RF06 | Registro diário de tomado/desfazer | Usa data local e dias escolhidos; não se apresenta como histórico clínico |
| RF07 | Avisos nativos opcionais | Permissão pedida por ação; recusa não bloqueia cadastro; editar/pausar/excluir cancela ou reagenda corretamente; não expõe nome/dose externamente |
| RF08 | Emergência | Contato abre discador; app funciona sem presumir capacidade de chamada; conteúdo aprovado pela equipe responsável |
| RF09 | Progresso/recompensas reais em fase posterior | XP, sequência e conquistas derivam do mesmo histórico, sem valores de demonstração |

RNF01: manter testes úteis de regras, componentes e jornadas; respeitar política existente de cobertura global de 70% sem reduzi-la para viabilizar merge. Incluir `src/` em collectCoverageFrom ao criar domínio fora de app/components, pois a configuração atual não cobre essa pasta.

RNF02: validar tamanhos de fonte, leitor de tela, labels, contraste, alvos de toque, teclado e diferentes tamanhos de aparelho. RNF03: primeira versão deve explicitar armazenamento local e limites de backup/sincronização; escolher proteção/retenção de dados antes de uso real de lembretes. RNF04: conteúdo local essencial deve ter comportamento offline definido; imagens externas precisam de fallback. RNF05: não prometer pontualidade absoluta de notificações; verificar restrições reais de Android/iOS, app fechado, reinício e mudança de fuso em aparelho.

Fora do primeiro incremento proposto: backend, login real, sincronização entre aparelhos, CMS, histórico clínico, recomendações de dosagem e lojas. A prioridade e necessidade de contas são decisões pendentes, não exclusões definitivas do produto.

## 8. Organização futura e pasta definitiva

Proposta: renomear posteriormente `InfoVida_github` para `InfoVida`, preservando seu `.git`. Ela será a única raiz executável, com um package.json/lockfile e uma aplicação Expo.

```text
InfoVida/
  .git/                 # histórico do time preservado
  .github/
  app/                  # somente rotas/layouts Expo Router
  src/
    components/
    features/           # artigos, quiz, lembretes, progresso
    domain/             # funções sem dependência de plataforma
    services/           # persistência e notificações
    theme/
  assets/
  tests/
  .maestro/
  docs/prd/
```

Antes de eliminar a pasta original do protótipo: guardar exportação integral em arquivo de referência fora da raiz ativa, inventariar assets/atribuições, concluir migração aprovada e comparar jornadas. Não versionar node_modules nem o build web. Não manter um segundo app web duplicado por padrão. Esta análise não renomeou, unificou ou excluiu pastas. Este PRD está fora dos dois projetos para revisão; numa implementação autorizada, incorporá-lo ao docs/prd do repositório definitivo.

## 9. Sequência de implementação proposta

1. **Estabilizar base:** corrigir Doctor/configuração, investigar E2E/artefatos, auditar vulnerabilidades e executar instalação limpa, lint, tipos, testes/cobertura e smoke. Entrega: baseline verificável.
2. **Resolver dependências:** Actions uma a uma; React/react-dom coordenados; decisões separadas para majors ESLint/TS. Reexecutar checks na combinação final.
3. **Extrair referência:** modelos de artigo/pergunta/lembrete, tokens, assets e atribuições; separar conteúdo de componentes, sem transportar dependências web.
4. **Estrutura e navegação:** rotas/tabs, componentes de base, entrada e início/artigos. Confirmar fidelidade visual com equipe.
5. **Lembretes:** portar domínio e testes; implementar armazenamento, ações e integração nativa. Testar falhas, fuso, virada do dia, repetição e cancelamento de notificações.
6. **Quiz e emergência:** portar fluxos e dados revisados; persistir tentativas conforme regras aprovadas; validar discador sem realizar chamadas em testes.
7. **Progresso:** definir fontes de eventos, XP, sequência diária e medalhas antes de construir perfil/recompensas reais.
8. **Consolidação:** validar jornadas com equipe, arquivar protótipo, ajustar nome da pasta e documentação de execução. Build interno exige configuração dos IDs, vínculo EAS e credenciais apropriadas.

Cada fase deve produzir uma alteração revisável separada quando autorizada. Não estimar cronograma sem capacidade da equipe, público/plataformas e escopo aprovados.

## 10. Decisões pendentes

- Confirmar prioridade Android/iOS/web e necessidade de distribuição inicial.
- Definir público, acessibilidade e quais telas do protótipo são obrigatórias no MVP.
- Confirmar modo visitante e necessidade de conta/sincronização na primeira entrega.
- Definir um horário por lembrete versus múltiplas doses e se haverá histórico.
- Definir responsável por conteúdo, revisão e manutenção de artigos/quizzes/emergência.
- Definir regras de XP, sequência, leituras e conquistas.
- Aprovar implementação local e, separadamente, qualquer publicação/ação nos PRs. Nenhuma publicação foi autorizada nesta etapa.

## 11. Validação realizada e limites

- Leitura das duas bases, configurações, telas, regras e testes existentes.
- Consulta autenticada ao repositório, referência main, sete PRs, diffs, 14 execuções e etapas de jobs. Logs completos examinados para CI/E2E do PR 1 e CI do PR 7; causas dos demais não foram presumidas a partir de mensagens inexistentes.
- Protótipo: `npm test` passou 9/9; `npm run build` passou. Build avisa chunk JS de aproximadamente 500 kB minificado; não é bloqueio de migração e não mede tamanho do app Expo.
- Playwright foi lido, mas não executado. Não houve inspeção visual em navegador/emulador nesta etapa.
- Base Expo sem node_modules local: não foram executados instalação, Doctor, lint, tipos ou Jest localmente. Resultados de CI documentados são remotos, não testes locais. Não se afirma que o app nativo está validado.
- `git ls-remote` via SSH falhou por permissões de configuração SSH do ambiente. A consulta remota foi concluída pelo conector GitHub; isso não demonstra problema de colaboração/permissão da usuária no repositório.
- Não foram verificadas vulnerabilidades atuais individualmente, proteções de branch, secrets, publicação em lojas, direitos completos das imagens ou correção clínica dos textos.

## 12. Referências de auditoria

- Base remota: https://github.com/infovida/info-vida/commit/d99a128d8d6542a5fbe26faacb2b70c0e8b00255
- PRs e discussões: https://github.com/infovida/info-vida/pulls
- CI/Doctor examinado: https://github.com/infovida/info-vida/actions/runs/40246926808
- E2E examinado: https://github.com/infovida/info-vida/actions/runs/40246926823
- Artefato desse E2E, ainda não examinado: https://github.com/infovida/info-vida/actions/runs/40246926823/artifacts/12620203746
- Conflito de instalação PR 7: https://github.com/infovida/info-vida/actions/runs/40246997223

Heads avaliados: PR1 `083b3856d45988490a25eb080026a1c3fb679236`; PR2 `8bb2d646df4454915bd39c5c8f2e467e109436ac`; PR3 `f63f581b2835730c932fa3fbdaa7b5b9f3bd5edf`; PR4 `4c41a9fefe5c7a7eaaed5ab2266051daea9a1116`; PR5 `b33d403839e39c26d914ff7d2959929216168164`; PR6 `8377953c2087f708c6a779a28735c135254466aa`; PR7 `71998760722020597020a38022dfe9499d564d82`.

## Revisão posterior — preparação da entrega e PRs automáticos

Em 27/10/2026, Ana pediu comandos de publicação da branch
`feat/base-expo-telas-demo-prds` e o encerramento dos PRs inadequados.
A busca autenticada confirmou sete PRs abertos; os diffs de #4–#7 foram consultados
novamente. A nova interface não torna atualizações de dependências desnecessárias.

| PR | Encaminhamento após revisão | Motivo |
| --- | --- | --- |
| [#1](https://github.com/infovida/info-vida/pull/1), [#2](https://github.com/infovida/info-vida/pull/2), [#3](https://github.com/infovida/info-vida/pull/3) | Manter abertos para reavaliação após integrar a base | Atualizações de Actions continuam pertinentes; precisam de CI na base final. Não foram aprovados ou mesclados. |
| [#4](https://github.com/infovida/info-vida/pull/4) | Recomendação: fechar sem merge e planejar migração | ESLint 10 isolado; lockfile ainda traz plugin React com peer até ESLint 9. |
| [#6](https://github.com/infovida/info-vida/pull/6) | Recomendação: fechar sem merge e planejar migração | TypeScript 7 isolado; ferramentas @typescript-eslint no diff declaram TypeScript <6.1.0. |
| [#5](https://github.com/infovida/info-vida/pull/5), [#7](https://github.com/infovida/info-vida/pull/7) | Recomendação: fechar os isolados e substituir por atualização conjunta validada | React e React DOM devem ser avaliados juntos com Expo/RN; #7 exige React ^19.3.1 enquanto mantém React 19.3.0 na raiz. |

Tentativa de fechar #4 pelo conector retornou HTTP 403,
`Resource not accessible by integration`. As demais mutações não foram tentadas
após essa recusa. **Nenhum PR foi fechado, aprovado ou mesclado.** Não confundir
permissão da integração com a permissão da colaboradora na interface do GitHub.
O fechamento recomendado pode ser feito pela interface do GitHub, se autorizado
pela permissão da conta. Não foram publicados comentários, commits, branches
remotas ou novos PRs. A configuração local do Dependabot já propõe agrupar
React/react-dom e adiar majors de ESLint/TypeScript; só terá efeito remoto após
integração. Não garante que PRs já existentes serão encerrados automaticamente.
