# PRD-004 — Entrada e apresentação

**Estado atual:** Implementado no escopo da entrada como visitante.

Entrada e acesso às abas entregues. Revisão visual/acessibilidade em aparelho pendente; autenticação real não integra esta entrega.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P1. Estado: implementado localmente; aceite visual no Android pendente.
Referência: `InfoVida_FigmaMake/src/app/components/Splash.tsx`.
Rota proposta: `/` em `app/index.tsx`; screen em `src/features/onboarding/`.
Dependência: [PRD-003](PRD-003-sistema-visual.md).

## Objetivo e jornada

Apresentar InfoVida e os vínculos institucionais; permitir acesso ao conteúdo
informativo sem exigir conta nesta etapa. Primeiro acesso e retorno voluntário
à entrada mostram a tela; a preferência de pular entrada não faz parte do MVP.

## Composição visual

Tela inteira com gradiente diagonal #1565C0 → #42A5F5 → #26C6DA, texto branco e
padding 24, respeitando status/navigation bars. Marca central na área flexível,
com caixa branca 95%, raio 40, padding 20 e logo PET-TECHSUS com largura de
referência 112 e proporção preservada. Nome InfoVida 36/700 e slogan
“Sua saúde, nossa prioridade” 18. Luzes/brilhos de fundo são decorativos e podem
ser superfícies translúcidas; não condicionam o primeiro carregamento.

Rodapé: CTA branco, texto azul 18/700, raio 32 e altura mínima 56; segunda ação
translúcida com borda branca somente quando houver função definida. Abaixo,
duas áreas lado a lado: “Desenvolvido por” + UNIFAL-MG e “Apoio” + logo
Ministério, em caixas brancas com cantos 16, logos contain com altura visual 40.
Rótulos pequenos passam a 12 sp legíveis. Em tela baixa/texto grande, conteúdo
rola; rodapé não fica sobre a marca. Nunca recortar logotipo para preencher caixa.

## Ações e diferenças intencionais

No protótipo, Entrar e Criar Conta fazem a mesma navegação para Home, sem login.
Proposta para versão local: CTA `Começar` abre `/home` substituindo a entrada no
histórico. Texto de apoio `Acesse os conteúdos sem criar conta`. Não mostrar
Criar Conta ativo sem formulário real. A posição/estilo visual dos CTAs permanece
referência para quando autenticação entrar no escopo. Essa troca de rótulo é
proposta de produto a confirmar; não exige credenciais fictícias.

Não confundir esta tela com splash nativa do sistema. A splash nativa deve ser
breve e usar marca/fundo coerentes, configurada em fase própria; não exibir botões
num splash de carregamento. Voltar da primeira aba não deve reinserir a entrada
repetidamente na pilha.

## Estados e dados

Pronta: assets embarcados e CTA disponível. Imagem ausente/falha: nome textual
InfoVida preservado e layout estável. Durante navegação, evitar duplo toque/rotas
duplicadas. Não bloquear por falta de internet. Não solicitar notificações na
entrada. Logos vêm de assets/figma-make, após revisão de uso institucional.

## Implementação e testes

View/LinearGradient, Image contain, Text e Pressable; wrapper rolável conforme
altura útil. Animação opcional da marca deve respeitar reduzir movimento e não
bloquear CTA. RNTL verifica texto/CTA e navegação; Maestro abre app e chega a Home.
Revisão visual compara gradiente, marca, rodapé e proporções com Splash.tsx.

## Critérios de aceite

- EN01: abrir offline mostra marca, slogan e ação legível sem tela vazia.
- EN02: tocar Começar uma ou várias vezes resulta em uma Home, sem pedir login.
- EN03: em 360 × 800 e fonte 200%, CTA/logos continuam alcançáveis por rolagem.
- EN04: TalkBack anuncia nome e CTA; decoração não cria elementos navegáveis.
- EN05: não há botão de cadastro sem função nem pessoa logada simulada.

Pendente: confirmar rótulo Começar, logos e créditos institucionais. Autenticação,
recuperação de senha, cadastro e consentimentos de conta exigem PRD futuro.


## Registro de implementação — 27/10/2026

- Screen em `src/features/onboarding/WelcomeScreen.tsx`, composta por `app/index.tsx`.
- Gradiente compartilhado da marca com proteção de contraste; marca PET-TECHSUS,
  InfoVida, slogan, CTA branco com texto azul 18/700 e rodapé institucional.
- Assets locais idênticos aos referenciados em Splash.tsx, com resizeMode contain,
  rótulo/papel acessíveis e fallback textual caso a imagem falhe. Não houve
  publicação dos logos; validação institucional permanece requisito de distribuição.
- Safe areas, conteúdo rolável sem limite fixo de altura, largura máxima 448 dp.
  Rodapé muda para uma coluna com fontScale >= 1,5. Textos de fallback crescem
  sem cortar a identificação da instituição; altura mínima da imagem é preservada.
- Começar abre `/home` com replace: entrada não fica atrás das abas no histórico.
  Guard síncrono e botão ocupado impedem duplicação por toque repetido. Se a
  navegação lançar erro, mensagem permanece visível e nova tentativa é liberada.
- Sem login, cadastro, solicitação de permissão ou chamada de API nesta etapa.
  A autorização para seguir a sequência de implementação adotou a entrada como
  visitante descrita no PRD; autenticação real segue fora deste incremento.
- Status bar clara somente enquanto a entrada está focada, restaurando o estilo
  escuro ao sair, inclusive se outra rota for aberta enquanto a entrada existir.
- Sem animação decorativa obrigatória, evitando atraso e respeitando redução de
  movimento por ausência de efeitos personalizados.
- Testes de componentes e Router real cobrem identificação, imagens indisponíveis,
  erro de navegação, toques repetidos e entrada sem retorno indevido. O teste com
  dimensões/fontScale simulados verifica disponibilidade/ação, não mede o layout
  físico nem substitui inspeção visual. Smoke Maestro inclui Começar e reinício
  do processo sem apagar dados locais.

Consulte [validação do PRD-004](../../validation/PRD-004-validacao.md).
Próxima etapa de produto: PRD-005, feed de notícias fictícias. Sem commit/PR.
