# PRD-006 — Leitura de artigo

**Estado atual:** Implementado no escopo da leitura de artigos fictícios.

Leitura, retorno ao feed e recuperação de identificadores inválidos entregues. Integração com API/conteúdo editorial e revisão em aparelho permanecem pendentes.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P1. Estado: implementado localmente junto ao PRD-005; revisão visual Android pendente.
Origem: `ArticleDetail.tsx`; rota `app/articles/[id].tsx`, feature `news`.
Dependências: [PRD-003](PRD-003-sistema-visual.md), [PRD-005](PRD-005-inicio.md).

## Objetivo e fluxo

Ler integralmente o conteúdo escolhido mantendo vínculo claro com a categoria,
origem e condição fictícia. Feed → detalhe pelo ID → voltar ao feed. Acesso direto
a ID inválido deve oferecer saída para Início.

## Layout preservado

Tela #F4F9FF. Header branco/translúcido com borda suave, seta azul à esquerda e
badge da categoria, padding 16. Imagem opcional de ponta a ponta no conteúdo
central, proporção 16:9. Corpo com margem/padding 24: título 24/700 com quebra
natural; origem e metadata 14 abaixo; resumo 16 itálico com borda esquerda ciano
4 e espaçamento 16; parágrafos 16, entrelinha ~24 e intervalo 16. Largura máxima
~672. Header respeita safe area. Sem barra inferior no detalhe nativo.

Banner `Conteúdo fictício para demonstração` aparece antes do título. Data
inexistente não é substituída por data atual; usar `Exemplo fictício`. Fonte da
fixture permanece `Equipe InfoVida — conteúdo fictício`. Manter visual de badge,
metadados e resumo mesmo sem imagem. Imagem ruim não impede o texto.

## Conteúdo, ações e regras

Resolver `Article` no mesmo repositório do feed, sem passar corpo completo em
parâmetros de URL. Renderizar array de parágrafos como Text, sem WebView ou HTML
arbitrário. Não abrir links externos silenciosamente. Se links entrarem no
conteúdo real, mostrar rótulo de origem e tratar falha de abertura.

No MVP demo, nenhuma abertura/conclusão gera leitura, XP ou progresso.
`Concluir leitura` é ação prevista para artigos reais, dependente da aprovação do
contrato de progresso: quando aplicada, aparece abaixo do último parágrafo,
registra ID uma vez e mostra `Leitura concluída`. Essa ação não aparece nas
fixtures, para não misturar exploração de layout e atividade real.

Voltar nativo/seta retorna à origem e preserva estado do feed. Sem histórico
válido, substituir por `/home`. Não incluir botão de compartilhar/favoritar antes
de definir funcionamento; ícones sem função não fazem parte da entrega.

## Estados e adaptação

Pronto; imagem ausente; loading se adapter assíncrono; erro com repetir; artigo
não encontrado com Voltar ao início. Título longo não é truncado. Corpo vazio ou
metadados inválidos são rejeitados na camada de dados e mostram indisponibilidade,
sem página aparentemente completa. Conteúdo demo embarcado funciona offline.

Stack nativo para transição lateral e gesto/Back. ScrollView no conteúdo finito;
header permanece acessível. `Image resizeMode=cover` para capa, nunca para logos.
Texto ampliado reflow sem corte; metadata pode quebrar em duas linhas.

## Critérios de aceite e testes

- AR01: título, resumo, categoria e parágrafos correspondem ao ID selecionado.
- AR02: aviso fictício é inequívoco e não há data/fonte real inventada.
- AR03: ID ausente/inválido não causa crash; ação retorna ao início.
- AR04: imagem falha mantém conteúdo e proporções estáveis.
- AR05: seta e botão Android retornam ao feed sem reiniciar filtro.
- AR06: leitura inteira é alcançável com fonte 200%; TalkBack segue ordem visual.

RNTL: resolução/erros, aviso, renderização e retorno. Maestro: abrir card,
rolar até final e voltar; confirmar ausência de XP/leituras demo. Revisão visual
compara capa, badge, título e bloco de resumo com origem.
Pendente: formato/links do artigo real ao definir API e regra final de leitura.


## Registro de implementação — 27/10/2026

ArticleScreen em src/features/news, rota `app/articles/[id].tsx`. O mesmo adapter
local do feed resolve ID e conteúdo, sem levar corpo por URL ou depender de API.
Stack sem barra inferior, header com Voltar/categoria, capa 16:9 opcional,
indicação fictícia, título/origem/metadata, resumo itálico com borda ciano e corpo
em Text por parágrafo. Capa inválida exibe fallback sem impedir leitura.

Estados de carregamento, erro com retry, ID ausente e artigo não encontrado são
explícitos. Voltar usa histórico quando disponível; em acesso direto sem histórico,
substitui por Home. Não há conclusão de leitura, XP, compartilhamento ou favoritos
simulados. Não foi implementada lógica para artigos reais nesta fase.

Router real testa card → detalhe → voltar, Back, categoria preservada, acesso
direto, ID inválido e erro/repetição. Ver [validação](../../validation/PRD-005-006-validacao.md).
A comparação com screenshot, TalkBack, fontes ampliadas e medidas físicas ainda
precisa ocorrer no aparelho; exportação Metro não comprova esses critérios.
