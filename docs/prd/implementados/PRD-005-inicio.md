# PRD-005 — Início e notícias de demonstração

**Estado atual:** Implementado no escopo de notícias fictícias.

Feed, filtros, estados e navegação para leitura entregues. API, fontes editoriais reais e revisão visual/acessibilidade permanecem pendentes; notícias reais não integram esta entrega.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P1. Estado: implementado localmente; revisão visual Android pendente.
Referência: `Home.tsx`. Destino: `app/(tabs)/home.tsx`, feature `news`.
Aplica-se [PRD-003](PRD-003-sistema-visual.md).

## Objetivo, escopo e jornada

Dar acesso a conteúdo informativo por categoria e demonstrar o feed antes da API.
Usuário entra → vê indicação de exemplos → filtra → abre artigo → volta mantendo
categoria/posição. Esta etapa não consulta API, não pede chave e não simula
notícia verdadeira. Futuro adapter de API é previsto, provedor ainda indefinido.

## Identidade e composição

1. Cabeçalho branco translúcido com borda azul suave: logo de referência altura
56, marca InfoVida 24/700 e avatar circular 40 à direita. No visitante, usar
ícone de pessoa; não iniciais MS de Maria Silva.
2. Banner visível `Demonstração — notícias fictícias`, apoio `Exemplos para
visualizar o aplicativo. A integração com notícias reais será feita depois.`
Superfície azul clara com ícone informativo; manter aviso ao trocar categoria.
3. Card de destaque azul → ciano, raio 24, padding 20, ícone em caixa 48/16.
Na primeira entrega: `Aprenda com o Quiz` e `Explore perguntas de educação em
saúde`, abre aba Quiz. Preserva composição do “Desafio Diário”, sem progresso
1/3, bônus +50 ou promessa de desafio diário ainda não implementado.
4. Chips horizontais com ícone, 14/600, raio pill, padding horizontal 16,
altura acessível >=48; ativo gradiente azul, branco; demais brancos/borda cinza.
5. Título `Notícias de exemplo` e cards brancos raio 24, intervalo 16,
imagem opcional 16:9, padding 20 × 16. Categoria em badge; título 16/700,
resumo 14 em até duas linhas, fonte/estado 12 e ação Ler mais azul.
6. Cinco abas do contrato comum. Conteúdo termina antes da barra.

Marca em gradiente de texto da web pode usar azul sólido no primeiro incremento
se não houver máscara compatível; manter gradiente no destaque e registrar a
simplificação. Não mudar o desenho global para obter esse efeito.

## Conteúdo e contrato

Modelo proposto `Article {id: string, categoryId, title, summary, body: string[],
imageAsset?, imageUrl?, sourceLabel, publishedAt?: ISO, isDemo: boolean}`.
Fixtures novas em `src/features/news/data/demoArticles.ts`, separadas dos JSONs
editoriais brutos em docs/reference. IDs estáveis; categorias por ID sem comparar
acentos do rótulo. Listar Todos, Vacinação, Prevenção, Saúde Mental, Fake News,
Nutrição, Exercícios, Emergência e Infância, conforme a origem; filtros sem itens
mostram vazio, não conteúdo de outra categoria.

Ter ao menos cinco exemplos, incluindo cards com/sem imagem e pelo menos duas
categorias. Exemplos de títulos: `Exemplo: encontro de educação em saúde`,
`Exemplo: oficina de leitura de informações de saúde`. Fonte `Equipe InfoVida —
conteúdo fictício`; metadata `Exemplo fictício`, sem “2h atrás” nem atribuição
inventada ao Ministério. Os textos brutos existentes não devem ser publicados
como se fossem notícias verificadas. Sem prescrições/datas de campanha inventadas.

Adapter `list({categoryId})` / `getById(id)` inicialmente local; camada de UI não
chama fetch. Evolução por API precisará paginação, mapeamento, origem, licença,
cache, timeout e erro: ainda não são implementação exigida para esta entrega.
Somente assets locais no conjunto inicial, evitando dependência de Unsplash online.

## Interações e estados

Avatar abre Perfil. Chip atualiza lista sem mudar aba; Todos restaura conjunto.
Card e Ler mais são uma única ação acessível. Voltar do detalhe restaura filtro
e rolagem. Categorias não são busca textual; não adicionar lupa sem função.
Inicializar fixtures sem spinner artificial. Se futuro repositório for assíncrono,
usar skeleton que preserva dimensões. Vazio: `Nenhum exemplo nesta categoria` e
`Ver todos`. Erro de dados: `Não foi possível carregar os exemplos` + Tentar
novamente. Falha de imagem usa placeholder e mantém título navegável.

## Implementação e verificação

FlatList com ListHeaderComponent, chips em ScrollView horizontal e ArticleCard
reutilizável; estados de filtro no feature, rotas com ID. Testes RNTL de filtro,
modo demo, vazio, fallback e card; Maestro entrada → chip → detalhe → voltar.
Não registrar leituras/progresso para fixture, conforme contrato comum.

## Critérios de aceite

- IN01: todas as fixtures têm isDemo e aviso aparece no feed e em cada detalhe.
- IN02: não há request externo de notícias nem segredo exigido para renderizar.
- IN03: filtrar não mostra itens de outra categoria; vazio tem recuperação.
- IN04: retornar de artigo preserva seleção e posição sempre que lista é a mesma.
- IN05: visitante não vê MS, nome ou progresso fictício apresentados como seus.
- IN06: cards, cabeçalho, gradiente, chips e abas seguem referência e cabem com fonte ampliada.

Pendentes: catálogo definitivo de categorias e provedor/API. Conteúdo de exemplo
pode ser alterado sem redefinir arquitetura da tela.


## Registro de implementação — 27/10/2026

- NewsScreen substitui HomeFoundation em `app/(tabs)/home.tsx`. Header branco,
  logo local, nome azul e avatar de visitante; marca em azul sólido é a
  simplificação visual já prevista no PRD. Destaque gradiente abre Quiz.
- Nove filtros, por ID estável, com ícones Lucide da mesma versão da exportação;
  CategoryChip compartilhado agora aceita ícone opcional. Barra mantém cinco abas.
- Seis notícias fictícias em `src/features/news/data/demoArticles.ts`, com/sem
  capa, em seis categorias; Emergência e Infância exemplificam filtro vazio.
  Não são os textos de notícias não verificadas do JSON editorial do protótipo.
- Duas ilustrações locais criadas em SVG/código e exportadas para PNG 800×450;
  não são fotografias de atividades reais. Sem imagens remotas ou dependências novas.
- Adapter `demoArticlesRepository` implementa o contrato existente e valida
  IDs únicos, categoria, textos/corpo, fonte e modo fictício. Recusa datas reais,
  URLs externas de imagem e material não fictício no conjunto local. Devolve
  cópias dos dados para não permitir que uma tela altere as fixtures.
- `useNewsResource` compartilha carregamento/erro/retry e ignora respostas tardias
  ao mudar filtro/ID ou desmontar. Skeleton sem atraso artificial; não há fetch.
- FlatList preserva componente/seleção ao abrir detalhe. Offset é capturado no
  scroll, fim do arraste e fim da inércia, e restaurado ao recuperar foco; ao
  trocar categoria começa do topo. Posição física exata precisa teste em Android.
- Card inteiro é uma única ação acessível, com título e indicação de demonstração.
  Não há notícias com fonte oficial inventada, data relativa falsa, XP ou leitura registrada.
- Artigos completos foram entregues no mesmo incremento (PRD-006), pois abrir
  um card é parte do fluxo de aceite do feed. Não foi acrescentado link sem destino.

Validação: [registro dos PRDs 005/006](../../validation/PRD-005-006-validacao.md).
Próxima etapa: categorias do Quiz (PRD-007). Nenhum commit/PR.
