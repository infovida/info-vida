# PRD-008 — Quiz: sessão de perguntas

**Estado atual:** Parcialmente implementado — sessão funcional em demonstração.

Respostas únicas, explicação, avanço e confirmação de saída entregues. Faltam conteúdo de saúde revisado, persistência e contrato de tentativa real; demonstração fica apenas na memória.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P2.
Origem: ramo de pergunta em `Quiz.tsx`; rota `app/quiz/session.tsx`.
Dependências: [PRD-003](../implementados/PRD-003-sistema-visual.md), [PRD-007](PRD-007-quiz-categorias.md).

## Objetivo e fluxo

Responder uma questão por vez, receber correção educativa e chegar ao resultado
sem contagem duplicada. Seleção → pergunta sem resposta → resposta bloqueada e
explicação → próxima → conclusão persistida → resultado.

## Layout

Fundo #F4F9FF. Header no gradiente da categoria, padding 20: emoji em caixa 44/16,
nome 16/700, ação de retorno, sequência compacta e X em caixa visual 40 com alvo
48. Adicionar `Questão X de N` como apoio legível. Barra branca sobre fundo
branco 20%, altura 8. Progresso = respondidas/N, 0 antes da primeira resposta.

Card central branco raio 32, padding 24, borda azul 10%, sombra; emoji em caixa
64 com superfície azul/ciano suave; enunciado 18/700 e alternativas verticais com
gap 12, padding 16, raio 16 e borda 2. Correta recebe gradiente ciano/azul e check;
escolhida errada recebe vermelho e X. Acrescentar texto `Correta`/`Sua resposta`
para não depender de cores. Após responder, mostrar explicação da questão em
bloco azul claro abaixo; o campo existe na origem, mas não é exibido nesse ramo.

CTA `Próxima pergunta` ou `Ver resultado` aparece após resposta, com gradiente
da categoria, altura >=56/raio 32, ancorado acima das abas. Medir área disponível;
card/explicação devem rolar acima de CTA e tab bar. Barra inferior indica Quiz.
Sem animação que atrase resposta ou feedback.

## Regras e dados

Sessão guarda ID, modo, categoria, snapshot/versão das perguntas, ordem,
respostas por ID e índice atual. Validação inicial exige N>0, IDs únicos,
alternativas e índice correto válido. Questão inválida bloqueia sessão com
mensagem; não corrigir silenciosamente índice de resposta.

Primeiro toque válido responde e bloqueia todas as alternativas até avançar.
`isCorrectAnswer` calcula acerto. +10 é proposta de XP por acerto, mas valor
final só é lançado após conclusão e gravação única da tentativa. Toques repetidos,
toques rápidos em duas opções e recarregar tela não aumentam score.
Não avançar sem resposta. Última resposta habilita concluir; enquanto grava,
desabilitar CTA e mostrar estado de processamento. Erro mantém sessão e permite
tentar novamente com mesmo attemptId (idempotência).

Sair pelo X, nome/categoria, aba ou Back usa uma confirmação única:
`Sair do quiz? As respostas desta rodada não serão contabilizadas.` Ações
`Continuar quiz` e `Sair`. Sem respostas, retorno pode ser direto. Background
mantém sessão em memória; reiniciar processo descarta rodada incompleta no MVP,
sem XP parcial. Não prometer retomada entre reinícios antes de implementá-la.

## Estados e recuperação

Sem sessão/deep link inválido → mensagem e Categorias. Sem resposta → opções
ativas e CTA ausente. Respondida → feedback, explicação, opções bloqueadas.
Concluindo → CTA ocupado. Falha persistência → erro + repetir sem duplicar.
Se app entra em background durante gravação, reconsultar attemptId ao retornar.
Perda de rede não afeta catálogo local. Modo demo explica que não salva progresso.

## Implementação e critérios de aceite

Reducer/controlador em src/features/quiz; UI não altera contadores globais.
Jest para transições, contagem e idempotência; RNTL para feedback/saída; Maestro
para rodada inteira e abandono. Mockar calendário/tempo sem depender da data real.

- QP01: uma resposta por questão; score correto mesmo sob toques repetidos.
- QP02: opções errada/correta e explicação são identificáveis por TalkBack.
- QP03: barra progride de 0 a 100%; botão final não corta conteúdo.
- QP04: toda saída da sessão com respostas confirma descarte e não lança XP.
- QP05: falha de salvar não apaga respostas nem mostra conclusão falsa.
- QP06: dados inválidos e ausência de sessão não causam exceção de renderização.

Pendente: revisão das explicações e aprovação de regras de progresso propostas.


## Entrega local — demonstração

Categorias, sessão e resultado conectados em uma jornada utilizável, preservando
cores, cards, gradientes e hierarquia do Figma Make. Catálogo local com 18 perguntas
sobre uso do app e leitura de informações, identificadas como demonstração.
Sem gravação de tentativa, XP, conquistas ou sequência; sessões somente em memória.
O progresso indisponível é exibido como tal. Conteúdo de saúde revisado, integração
com histórico persistente e regras de gamificação permanecem pendentes.
Evidências e limites no [registro de validação](../../validation/PRD-007-009-demo-validacao.md).
