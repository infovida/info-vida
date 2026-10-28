# Referência de migração do Figma Make

Origem: exportação local `InfoVida_FigmaMake`, recebida para análise em 27/10/2026.

- `articles.draft.json`: oito artigos extraídos de Home.tsx.
- `quiz.draft.json`: seis categorias e dezoito perguntas extraídas de Quiz.tsx.
- `../../../assets/figma-make/`: imagens originais preservadas.
- `ATTRIBUTIONS.md`: atribuições fornecidas com a exportação.

Os JSONs são rascunhos de referência, não carregados pelo aplicativo. Textos,
fontes, datas relativas e orientações de saúde precisam de revisão editorial
antes de publicação. As classes CSS do catálogo do quiz também são referência;
a apresentação nativa deverá usar os tokens/estilos do app.

Regras portadas para `src/domain/`: lembretes e seleção/correção de questões.
A geração de IDs fica a cargo da futura integração nativa; não depende de
`window.crypto`. Persistência e notificações ainda não foram conectadas ao Expo.
Não copiar o provider web: ele depende de localStorage, DOM e timers de aba.

A exportação integral permanece na pasta de referência externa ao repositório,
para comparar as telas durante as próximas fases. Nenhum código HTML/CSS ou
biblioteca Radix/shadcn foi acrescentado ao runtime nativo.


## Referência local e conteúdo compartilhado

A exportação completa está em `../InfoVida_FigmaMake/`, relativamente à raiz do
repositório InfoVida: é uma pasta irmã local e está fora do alcance deste Git.
Não é dependência de instalação, execução ou testes e não será incluída no commit.
O `.gitignore` também protege contra uma cópia acidental com esse nome dentro da raiz.

Esta pasta `docs/reference/figma-make/` será compartilhada: contém somente os
rascunhos extraídos e atribuições para documentar a migração. Os assets usados pelo
app em `assets/` também precisam ser compartilhados. Não são a exportação web completa.
Quem clonar o projeto consegue rodar o app sem a pasta externa; a referência visual
original permanece disponível localmente para as próximas implementações.
