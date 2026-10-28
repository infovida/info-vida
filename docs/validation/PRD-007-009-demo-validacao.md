# Validação local — PRD-007 e demonstração dos PRDs 008/009

Data: 27/10/2026. Sem commit, PR ou publicação.

## Escopo entregue

Seis categorias com cores do Figma Make, contagens derivadas, layout adaptável
para uma coluna, carregamento/erro/repetir/vazios e Quiz Aleatório com até cinco
perguntas únicas. Sessões congelam catálogo/versão antes de navegar e bloqueiam
abertura repetida. Resposta única, feedback com explicação, avanço e resultado
calculado das respostas. Repetir abre uma nova sessão; links inválidos permitem
voltar às categorias. Saída após responder pede confirmação, inclusive Voltar e
mudança de aba. A barra compartilhada mantém cinco abas.

Catálogo: 18 exemplos sobre navegação e leitura de informações, três por categoria.
Não são perguntas clínicas aprovadas. Avisos demo aparecem na seleção, sessão e
resultado. Nenhum progresso, tentativa persistida, XP ou conquista é gravado.
Histórico indisponível não vira sequência zero; histórico vazio conhecido usa zero.
Sessões ficam na memória (limite de 20) e são perdidas ao reiniciar.

Gradientes agora recortam a camada interna nos cantos arredondados, preservando
também a correção do quadrado observado no filtro de notícias. Nenhuma nova
dependência de runtime foi adicionada; ícones locais seguem a licença existente.

## Evidências automatizadas

Testes de domínio validam catálogo, referências, versões, opções, sessões imutáveis,
sorteio sem repetição, respostas/avanços duplicados e resultado derivado.
Testes com Expo Router real cobrem categorias, erro/repetir/vazios, resultado,
repetição, confirmação X/Voltar/abas e recuperação de links inválidos.
Contraste é verificado também sobre os gradientes de categorias.

## Pendências e teste manual

No Android: abrir `npx expo start --go --clear`, entrar em Quiz, escolher Vacinação,
responder as três perguntas e conferir explicações/resultado. Repetir, tentar sair
após responder, cancelar e confirmar. Testar aleatório, cinco abas, fonte 200%,
TalkBack e telas estreitas. Conferir os cantos dos filtros de notícias.

Maestro atualizado para categoria → sessão → sair → categorias, mas não executado
em aparelho/emulador nesta etapa. Testes de componentes não comprovam aparência
em pixels, gestos nativos ou acessibilidade real. Comparação visual em aparelho
permanece pendente. Exportação Metro não equivale a APK/EAS.

Restam catálogo de saúde revisado, armazenamento de tentativas, histórico unificado
com Perfil e regras aprovadas de gamificação para concluir os modos reais de 008/009.


## Resultado dos comandos

`npm run validate`: lint sem avisos, TypeScript e 58 testes em 12 suítes aprovados.
Cobertura: 94,88% de statements e 91,01% de branches, acima do mínimo de 70%.
`CI=1 EXPO_OFFLINE=1 npx expo export --platform android --platform web
--output-dir /tmp/infovida-prd007-bundles --max-workers 2`: exportações Android
Hermes e web aprovadas. Artefatos fora do repositório. `git diff --check` aprovado.
