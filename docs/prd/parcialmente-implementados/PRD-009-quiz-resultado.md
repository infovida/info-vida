# PRD-009 — Quiz: resultado

**Estado atual:** Parcialmente implementado — resultado funcional em demonstração.

Pontuação derivada, repetição e retorno entregues. Faltam gravação idempotente de tentativa real, histórico e regras aprovadas de XP/conquistas; a demonstração não gera progresso.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P2.
Origem: resultado em `Quiz.tsx`; rota `app/quiz/result/[attemptId].tsx`.
Contratos: [PRD-003](../implementados/PRD-003-sistema-visual.md), [PRD-008](PRD-008-quiz-perguntas.md).

## Objetivo e composição

Exibir resultado fiel à tentativa e encaminhar para repetir, categorias ou início.
Fundo gradiente de marca em tela inteira, caixa branca central de largura até
448, raio 32/padding 24, espaçamentos 16 e rolagem se necessária. Troféu branco em
círculo gradiente 80, ícone 40 e adorno de brilho opcional. Título 30/700 em azul,
mensagem de conclusão 14. Preservar ordem visual da origem.

Bloco de pontuação azul/azul claro, raio 16/padding 16, rótulo Pontuação Final,
valor 48/700, legenda XP (Pontos de Experiência), percentual e acertos X/N.
Mensagens propostas: 100% `Excelente!`, 50–99% `Muito bem!`, abaixo de 50%
`Continue aprendendo!`; não associar resultado a diagnóstico/conhecimento clínico.

Sequência compacta em fundo laranja claro com borda; texto escuro para contraste.
Duas ações lado a lado `Categorias` (borda azul) e `Repetir` (gradiente), com
quebra para coluna em fonte ampliada. `Voltar para o início` abaixo, azul em
superfície azul clara. Cinco abas, Quiz ativo. Confete é decorativo e opcional,
uma vez por apresentação e desligado com redução de movimento.

## Regras e navegação

Ler tentativa pelo attemptId; percentual = round(acertos/N × 100), N>0.
Mostrar earnedXp realmente gravado; não recalcular com regras novas sobre
histórico antigo. Não dividir por zero. Conclusão de demonstração mostra
`Resultado de demonstração — progresso não salvo`, em vez de informar XP ganho.

Resultado não cria eventos: a conclusão já foi persistida pela sessão. Reabrir,
rotacionar/foreground ou voltar ao resultado não premia de novo. Perfil e
Recompensas são atualizados pelo repositório compartilhado.

Categorias encerra a sessão e substitui navegação pela aba Quiz. Repetir gera
novo attemptId; categoria mantém conjunto editorial atual, modo aleatório sorteia
novamente. Voltar ao início abre Home. Back deve retornar às categorias, sem
reativar formulário de respostas concluído. Pressões rápidas não iniciam duas
rodadas. Ausência de attemptId válido mostra indisponível + Categorias.

## Estados e adaptação

Carregando tentativa; resultado real; resultado demo; tentativa ausente/inválida;
erro de leitura com repetir. Números sem dados não são preenchidos com 2150/7.
Streak indisponível pode ter mensagem própria sem esconder o resultado gravado.
Fonte ampliada faz card rolar e ações empilharem, sem overflow escondido.

Implementação: componente ResultSummary alimentado por modelo, serviço de
navegação com replace/reset apropriado. Nenhuma função de prêmio dentro de
useEffect da screen. Não usar DOM/canvas para animações.

## Critérios de aceite e testes

- QR01: tentativas 0/N, parcial e N/N exibem percentual e XP coerentes.
- QR02: reabrir o mesmo resultado não muda XP, conquistas ou total de quizzes.
- QR03: Repetir cria outra rodada; aleatório não reutiliza sessão concluída.
- QR04: Categorias, Início, abas e Back encerram o fluxo de forma previsível.
- QR05: 0 questões/ID inválido produz estado recuperável e não NaN/crash.
- QR06: resultado e ações são visíveis com fonte 200% e redução de movimento.

Jest: cálculos/leitura idempotente; RNTL: estados e ações; Maestro: concluir,
consultar perfil, reabrir resultado e verificar que o total não duplicou.
Pendente: regra definitiva de XP e vocabulário de feedback da equipe.


## Entrega local — demonstração

Categorias, sessão e resultado conectados em uma jornada utilizável, preservando
cores, cards, gradientes e hierarquia do Figma Make. Catálogo local com 18 perguntas
sobre uso do app e leitura de informações, identificadas como demonstração.
Sem gravação de tentativa, XP, conquistas ou sequência; sessões somente em memória.
O progresso indisponível é exibido como tal. Conteúdo de saúde revisado, integração
com histórico persistente e regras de gamificação permanecem pendentes.
Evidências e limites no [registro de validação](../../validation/PRD-007-009-demo-validacao.md).
