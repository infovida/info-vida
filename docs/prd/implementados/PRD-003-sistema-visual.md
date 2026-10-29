# PRD-003 — Sistema visual, navegação e contratos compartilhados

**Estado atual:** Implementado no escopo da fundação visual e contratos.

Tema, componentes e navegação entregues. Contratos de persistência são interfaces, sem adapters prontos. Permanecem revisão visual, TalkBack, fonte ampliada e integração de histórico nas próximas funcionalidades.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Estado: fundação implementada localmente; conferência visual no Android pendente. Prioridade P0, antes das telas.
Origem: `src/styles/theme.css`, `src/app/components/BottomNav.tsx`,
`StreakCalendar.tsx` e `src/app/App.tsx` da exportação Figma Make.
Aplica-se a todos os PRDs deste diretório.

## 1. Objetivo e fidelidade

Traduzir a identidade visual existente para componentes React Native reutilizáveis.
Preservar fundo azul muito claro, cards brancos arredondados, gradientes azuis e
ciano, hierarquia forte de títulos, ícones lineares e respiros. Emergência mantém
identidade vermelha e conquistas conservam suas cores por categoria.
Não redesenhar o app como uma interface genérica do sistema.

Fonte real observada: theme.css define tamanho base 16 e pesos 400/500; as telas
usam também 600/700. fonts.css está vazio: não existe fonte personalizada
comprovada. Proposta: fonte de sistema do React Native, preservando escala e
pesos; uma fonte futura exigirá aprovação visual e arquivos/licença.

## 2. Tokens de referência → implementação

Valores abaixo saem do código; medidas CSS viram referências lógicas em dp/sp,
com validação de leitura, safe areas e escala de texto, não conversão física 1:1.

| Token planejado | Valor | Uso |
| --- | --- | --- |
| colors.background | #F4F9FF | fundo principal |
| colors.surface | #FFFFFF | cards, formulários e cabeçalhos claros |
| colors.text | #1A1A1A | texto base do tema |
| colors.title | #1F2937 | gray-800 das telas |
| colors.body | #374151 | gray-700 da leitura |
| colors.muted | #64748B | texto secundário do tema |
| colors.primary | #1565C0 | ações, seleção e marca |
| colors.secondary | #42A5F5 | gradientes e detalhes |
| colors.accent | #26C6DA | destaques ciano |
| colors.softBlue | #E3F2FD | superfícies secundárias |
| colors.border | rgba(21,101,192,0.08) | borda padrão |
| colors.focus | #1565C0 | realce de foco |
| colors.danger | #EF4444 | exclusão, erro e emergência |
| colors.dangerDark | #DC2626 / #B91C1C | gradiente Emergência |
| colors.success | #16A34A | texto/ícone de registro confirmado |
| colors.warning | #B45309 | texto de aviso sobre fundo claro |
| gradients.brand | #1565C0 → #42A5F5 → #26C6DA | entrada e cabeçalhos |
| gradients.action | #1565C0 → #42A5F5 | CTA principal |
| gradients.education | #1565C0 → #26C6DA | destaque/quiz |
| gradients.reminders | #1565C0 → #1976D2 → #42A5F5 | lembretes |

Gradientes de categoria/conquista devem ser arrays de cores e direção, nunca
strings Tailwind. Usar fundo de alto contraste na região do texto: não assumir
que texto branco funciona em qualquer ponto ciano do gradiente. Vermelho e verde
sempre acompanhados por texto/ícone. Cinzas claros do protótipo podem ser
escurecidos para legibilidade, documentando a adaptação.

| Escala | Valores lógicos propostos |
| --- | --- |
| Espaçamento | 4, 8, 12, 16, 20, 24, 32, 40, 48 |
| Margem horizontal | 16 no feed/perfil; 20 no quiz; 24 nos lembretes/emergência |
| Raios | 12 ícones/ações; 16 campos; 20 base do tema; 24 cards; 32 CTA/modais; 40 caixa da marca na entrada |
| Ícones | 16 metadados, 20 ações, 24 abas, 32/40 destaques |
| Caixas de ícone | 40, 48, 56, 64 conforme tela |
| Tipografia | 12 metadados, 14 apoio, 16 corpo/campo, 18 subtítulo, 20 seção, 24 título, 30 destaque, 36 marca, 48 pontuação |
| Pesos | 400 corpo; 500 apoio; 600 labels/botões; 700 títulos |
| Entrelinhas | aproximadamente 1,4–1,6 para leitura e 1,2–1,35 para títulos; medir sem cortar texto |

Textos de 9–11 px do protótipo devem partir de 12 sp no app, mantendo hierarquia.
Não limitar fontScale globalmente para caber no desenho. Cards crescem; títulos
não truncam conteúdo crítico. Badge e chip expandem para acomodar tradução/texto.

## 3. Componentes e comportamento nativo

`Screen`, `BrandHeader`, `GradientButton`, `SurfaceCard`, `CategoryChip`,
`IconButton`, `EmptyState`, `ErrorState`, `InlineNotice`, `ProgressBar`,
`ConfirmDialog`, `Toast`, `StreakCalendar` e barra inferior compartilhados.
Componentes implementados em `src/components/`: `layout.tsx`, `controls.tsx`,
`feedback.tsx`, `StreakCalendar.tsx` e `AppIcon.tsx`. Consulte o registro ao final
para adaptações técnicas e limites da etapa.

| Web original | Adaptação proposta |
| --- | --- |
| div/header/article | View, Text e semântica acessível |
| button e hover | Pressable com estados pressed/disabled/loading |
| img e object-fit | Image com resizeMode e fallback |
| lista longa + overflow | FlatList; ScrollView em conteúdo finito |
| gradient CSS | expo-linear-gradient compatível com SDK instalado |
| sombra CSS | elevação/sombra nativa; resultado visual verificado em Android |
| blur/backdrop-filter | superfície branca translúcida como fallback; blur é melhoria opcional |
| fixed/sticky | navigator/tab bar e área de ações calculada com insets |
| motion/confetti | Animated/LayoutAnimation e efeito nativo opcional; não adicionar canvas-confetti |
| dialog/form DOM | Modal/Stack, TextInput, KeyboardAvoidingView e controles acessíveis |
| localStorage | interface assíncrona de repositório; implementação a escolher/testar |

Não instalar NativeWind, Radix ou biblioteca de animação apenas para copiar classes.
Manter a base StyleSheet do time. `expo-linear-gradient` e ícones compatíveis são
adições planejadas; instalar com alinhamento ao SDK, atualizar lockfile e validar.
Conjunto de ícones deve reproduzir Home/Brain/Bell/AlertCircle/User, traço próximo
de 2 e 2,5 no ativo; preferir biblioteca já compatível com Expo. Evitar novo pacote
SVG sem necessidade demonstrada. Animações de 150–300 ms para feedback; respeitar
redução de movimento, sem pulsação infinita em ações críticas.

## 4. Rotas e navegação

```text
app/
  _layout.tsx                  # Stack raiz
  index.tsx                    # Entrada
  (tabs)/
    _layout.tsx                # 5 abas persistentes
    home.tsx
    quiz.tsx
    reminders.tsx
    emergency.tsx
    profile.tsx
  articles/[id].tsx
  quiz/session.tsx
  quiz/result/[attemptId].tsx
  reminders/editor.tsx
  rewards.tsx
  notifications.tsx
```

Abas: Início, Quiz, Lembretes, Emergência, Perfil, nessa ordem. Ícone 24, label 12
semibold; fundo branco quase opaco e borda azul suave. Ativo azul com cápsula azul
10% e pequeno indicador; Emergência usa vermelho mesmo inativa e deve ter cápsula,
texto acessível de seleção e indicador quando ativa. Recompensas mantém Perfil
como origem visual. Deep links externos para dados ausentes têm estado de erro e
saída para Início, sem exceção de renderização.

Detalhe de artigo e editor ficam no Stack, sem barra inferior, para leitura/teclado.
Quiz sessão/resultado preservam barra inferior visual por um shell compartilhado
com o navegador: não criar cinco cópias independentes da barra. Sair da sessão por
aba, X, categoria ou Voltar usa a mesma proteção de descarte. Somente uma tab bar
pode estar visível. Cabeçalhos/CTAs nunca cobrem texto. Back fecha modal primeiro,
depois retorna à origem; não duplica entrada no histórico.

## 5. Dados e fronteiras

Todos os dados são locais nesta fase. Feed tem `mode: demo` explícito; nenhuma
chave de API, servidor ou login necessários. Nenhum exemplo fictício é salvo como
progresso do usuário. Catálogos da exportação em docs/reference são material
editorial, não importação direta automática para UI.

Repositórios propostos: ArticlesRepository (`list`, `getById`),
QuizRepository (`categories`, `questions`), ReminderRepository (CRUD versionado),
ProgressRepository (tentativas/eventos), NotificationRepository (itens/lidos).
Adapters separáveis permitem trocar fixtures por API mantendo tipos internos.
Não escolher provedor de API nesta fase. Arquivos de rota só compõem screens de
`src/features/`; regras ficam em `src/domain/`, infraestrutura em `src/services/`.

Persistência: versionar documentos, validar ao carregar, serializar gravações e
retornar erro sem destruir dados inválidos. Definir migração por versão e recuperação
antes de mudar schema. Cache não equivale a backup; localStorage web não é lido no
Android. Data/hora e ID são dependências explícitas de serviços testáveis.
Dados clínicos/medicamentos não vão para logs, telemetria ou conteúdo de notificação.

## 6. Contrato de progresso — proposta a confirmar

Evitar regras diferentes em Quiz, Perfil e Recompensas. Catálogo e eventos únicos:
`QuizAttempt {id, categoryId, mode, questionIds, contentVersion, answers,
correctCount, totalQuestions, earnedXp, completedAt, completedLocalDate}`.
Persistir tentativa concluída uma vez por ID; completar/reabrir resultado não
reconta. Sessões abandonadas não entram nas estatísticas. Versão das perguntas
fica congelada durante a sessão. Conteúdo demo de apresentação não gera eventos.

Proposta inicial: 10 XP por acerto em tentativa concluída, 0 por erro; repetir
cria nova tentativa e pode gerar XP novamente (sem ranking/competição no MVP).
Conquistas inicialmente não adicionam XP: números de bônus do protótipo são
rascunhos e não serão somados sem nova regra. Nível = 1 + floor(XP/500), barra =
(XP % 500)/500. Logo, 2150 XP implica nível 5 e 350 XP para o nível 6, corrigindo
nível 11 fixo do protótipo. Valor 0 implica nível 1, barra 0%, faltam 500 XP.

Sequência: pelo menos um quiz concluído por data local. Eventos do mesmo dia
contam um dia. Se hoje não tem evento, mantém sequência até ontem; se último dia
foi anterior a ontem, atual é 0. Recorde é maior sequência do histórico. Datas
futuras não contam. Usar datas civis consecutivas, não diferença de 24h, e guardar
localDate do evento para não reinterpretar todo histórico ao viajar. Recalcular
ao voltar ao foreground e na virada do dia. Calendário marca só datas realmente
registradas, com nomes completos acessíveis dos dias; não deduz histórico pelo
número da sequência. Compacto usa texto escuro em fundo claro, corrigindo branco
sobre laranja claro do componente original.

Leitura (proposta): ação explícita `Concluir leitura` no rodapé do artigo registra
um ID de artigo uma vez. Abertura isolada não vale leitura. Leitura de demonstração
não conta para métricas nem conquista. Temas favoritos devem mostrar contagem de
leituras reais por categoria; não porcentagem sem denominador definido. Antes de
haver dados reais, seção vazia explicativa, sem os valores estáticos do protótipo.

Catálogo inicial proposto comum a Perfil/Recompensas: Primeiros Passos (1 quiz),
Bem Hidratado (5 leituras únicas reais de nutrição), Pró-Vacinação (quiz completo
da categoria com 100%), Em Chamas (recorde 7 dias), Mestre do Quiz (25 concluídos),
Explorador (1 em cada uma das 6 categorias), Perfeccionista (5 tentativas completas
com 100%). IDs estáveis conforme Profile.tsx; 2 conquistas secretas do protótipo
ficam fora do catálogo ativo até definir regras. Conquista de vacinação mede
conhecimento, nunca vacinação efetiva. Total conquistado deriva do catálogo ativo;
progresso limitado ao total; earnedAt não muda ao reabrir. Catálogo é versionado.

## 7. Acessibilidade, offline e aceite comum

Todos os controles têm nome, papel e estados acessíveis; ícones decorativos são
ignorados por TalkBack. Alvos de toque mínimos 48 × 48 dp, inclusive ícones
visualmente menores via padding/hitSlop sem colisões. Controles de dia podem
quebrar em linhas. Contraste deve ser medido: meta 4,5:1 em texto normal e 3:1
em texto grande/controles relevantes, sem presumir aprovação pela cor original.

Validar fontes a 100% e 200%, tela estreita, navegação por TalkBack, teclado,
recorte e gestos do Android. Espaço inferior = altura real da tab bar + insets +
CTA quando existir; não copiar pb-44/bottom-24 literalmente. Retrato é requisito
inicial já configurado. Em tablet, centralizar conteúdo até ~672 dp como max-w-2xl,
sem alargar cards indefinidamente. Suporte a paisagem é decisão futura.

Modo claro é referência de aceite. app.json hoje está automatic: a implementação
deve fixar tema claro ou fornecer todos os tokens dark antes de seguir sistema;
essa fase propõe-se claro. Não herdar .dark genérico da exportação sem revisão.

Offline: feed demo e catálogos embarcados continuam; imagens locais preferidas;
erros de imagem não bloqueiam leitura. Dados ainda não carregados, carregamento,
vazio, erro recuperável e indisponibilidade da capacidade do aparelho são estados
separados. Erro de gravação não vira toast de sucesso. Nenhum botão funcional
pode ficar sem resposta; capacidade futura fica omitida ou desabilitada com explicação.

Aceite de cada tela: elementos na mesma ordem visual da origem; cores/tokens
corretos; sem sobreposição; sem dados pessoais fictícios apresentados como reais;
CTAs e Voltar funcionam; estados testados; sem log de dados sensíveis; testes da
base e cobertura aprovados; comparação visual registrada. Fidelidade definitiva
exige screenshots e validação da equipe, ainda não realizadas.

## 8. Referências técnicas e pendências

[Tabs Expo Router](https://docs.expo.dev/router/advanced/tabs/),
[LinearGradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/),
[Notificações Expo](https://docs.expo.dev/versions/latest/sdk/notifications/).
Documentação latest orienta viabilidade; conferir APIs na versão efetivamente
instalada do SDK 58 antes de implementar. Notificações remotas não são requisito;
Expo Go não comprova comportamento de app fechado ou build própria.

A confirmar: regras propostas de progresso, edição de perfil/contas, fonte
customizada, dark mode, direitos dos logos e catálogo editorial. Não instalar
bibliotecas nem mudar app.json só pela existência deste documento.


## 9. Registro de implementação — 27/10/2026

### Entrega local

- Tokens tipados em `src/theme/tokens.ts`: paleta, gradientes, fontes de sistema,
  escalas, raios, limites de toque/largura e sombras. Modo claro em app.json.
- Screen responsivo/rolável, BrandHeader, SurfaceCard e GradientSurface;
  botões com disabled/loading, foco e nome acessível, chips selecionáveis,
  barra de progresso limitada, estados vazio/erro, avisos, toast e confirmação.
- Layout Expo Router com cinco abas usando `expo-router/ui` já instalado;
  cápsula/indicador ativos, Emergência vermelha, safe area e altura flexível.
  Nenhuma biblioteca de UI web acrescentada ao aplicativo.
- Início provisório com identidade visual e áreas de preparação para Quiz,
  Lembretes, Emergência e Perfil. Rotas são arquivos pequenos, composição em
  src/features/foundation. Não há simulação de funcionalidades concluídas.
- Índice redireciona ao Início até implementar a Entrada do PRD-004.
  Rota inexistente mostra recuperação. Detalhe/editor/sessão/resultado,
  Recompensas e Notificações serão criados nos seus PRDs, sem links mortos agora.
- Calendário baseado em datas reais recebidas, sem estatísticas fixas;
  sequência/recorde com dias civis, lacunas preservadas, futuro ignorado,
  atualização na meia-noite e ao retornar ao app. Ainda não conectado a histórico.
- Contratos tipados de repositórios em src/services/contracts.ts, sem escolher
  provedor/API/armazenamento. Persistência e fila de gravação são requisitos
  para implementar esses adapters nos próximos PRDs, não serviços prontos.
- Regras de XP/conquistas continuam propostas documentadas, sem conceder pontos
  ou mostrar números fictícios no aplicativo nesta entrega.

### Adaptações fundamentadas

O React Native 0.88 efetivamente instalado oferece `backgroundImage` com
gradientes lineares nativos (tipos e processador confirmados no pacote local).
Usamos essa capacidade em vez de acrescentar expo-linear-gradient. O wrapper
GradientSurface centraliza o efeito; não há instalação adicional nem uso do
experimental_backgroundImage. Fonte: [View Style Props 0.88](https://reactnative.dev/docs/view-style-props#backgroundimage).

Os mesmos ícones de lucide-react 0.487.0 da exportação foram preservados como
SVG fonte e PNG transparente de 96×96, normal 2 e ativo 2,5. Image aplica tintColor
e tamanho lógico; não carrega fonte nem biblioteca SVG. Licença completa em
assets/icons/LICENSE-lucide. Script opcional scripts/render-icons.py permite
regerar em Ubuntu; não roda no install nem no aparelho.

Textos sobre gradiente têm proteção de contraste azul escuro translúcida, mantendo
a paleta. Textos de sucesso/aviso e Emergência usam variações mais escuras para
atingir contraste AA. Testes medem contraste das combinações de texto/superfície
e amostras dos gradientes, não substituindo revisão visual/TalkBack.

Animações decorativas foram omitidas nesta fundação; não há pulsação, confete ou
movimento obrigatório. As próximas telas podem adicionar feedback respeitando
redução de movimento. As medidas do Figma continuam referência, não garantia de
pixels físicos idênticos sem inspeção no aparelho.

### Validação e limites

Lint, TypeScript e suíte Jest com cobertura global executados. Os testes agora
usam expect/Jest em vez de node:assert, corrigindo incompatibilidade de tipos
que só se tornou visível após instalação completa da base.
Testes de navegação usam o Router real, incluindo suas abas; não mockam a troca
de rotas. Interações cobrem loading/disabled, erro de gravação, foco/seleção,
confirmação, aviso, calendário e virada de data. Smoke Maestro atualizado para
as abas; execução em Android ainda necessária.

Exportações Metro de Android/web e resultados finais estão em
[registro de validação](../../validation/PRD-003-validacao.md).
A tentativa de screenshot por Chrome/Playwright foi bloqueada pelo sandbox
(`setsockopt/shutdown: Operation not permitted`). Não houve screenshot aprovado,
comparação visual final, teste com TalkBack nem fontScale 200% no aparelho.
Esses itens devem ser conferidos no Expo Go e depois em build nativa.
Nenhum commit, push ou PR foi criado.
