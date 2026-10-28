# PRD-014 — Recompensas, nível e conquistas

**Estado atual:** Não implementado como funcionalidade.

Tela, catálogo e integração com histórico ainda pendentes. Regras de XP, nível e conquistas são propostas a confirmar.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P3.
Origem: `Rewards.tsx`; rota proposta `app/rewards.tsx`, acesso por Perfil.
Dependências: [PRD-003](../implementados/PRD-003-sistema-visual.md), [PRD-013](PRD-013-perfil.md).

## Objetivo e composição

Mostrar evolução educativa com dados consistentes, sem atribuir estado clínico
ou materializar prêmio inexistente. Header gradiente de marca, padding 24,
título `Recompensas` 30/700, apoio `Continue evoluindo!`, caixa translúcida XP
Total à direita. Acesso nativo inclui Voltar ao Perfil, sem duplicar cabeçalho.

Card translúcido raio 24 com número do nível em caixa 56/16, título 18,
quantidade para próximo e barra de 12 com gradiente branco/ciano. Abaixo dois
cards translúcidos lado a lado: dias seguidos e conquistas. Corpo margem 24,
seção `Suas Conquistas` com ícone Award e cards de medalha: ícone/emoji 32 em
caixa 64/16, nome 12/700, data e estado. Grid original tem quatro colunas, mas
no mobile proposto usar duas quando quatro não comportarem texto/alvos; ampliar
em tablet se couber. Manter aparência de medalhas e paleta, sem reduzir labels
para caber quatro em 360 dp.

Ativa visualmente Perfil na barra inferior compartilhada, conforme origem;
Voltar retorna ao Perfil. `Recompensas` não vira sexta aba.

## Regras e dados

Usar ProgressRepository/catálogo do PRD-003. Nível 1 e XP 0 em primeira execução.
Proposta 500 XP por nível; 2150 XP → nível 5, barra 30%, faltam 350 XP. Não copiar
currentLevel=11/currentXP=2150 da exportação. Barra, nível e faltante devem
sempre sair da mesma função e nunca ultrapassar faixa esperada.

Um catálogo ativo de conquistas com mesmo ID/nome/regra no Perfil. Adotar nomes
educativos de Profile.tsx como referência principal; `Vacinado` da Rewards é
substituído por `Pró-Vacinação`, pois só houve atividade de conhecimento. Cores
preservadas por identidade da conquista (cinza, azul, ciano, vermelho/laranja,
dourado, violeta e ciano claro). Não manter Expert/Campeão/Lendário sem requisito
real definido. Propostas de critérios estão em PRD-003, aguardando confirmação.

Conquista bloqueada mostra como obter e progresso; não data falsa. Conquistada
mostra earnedAt real e selo. Nesta proposta medalhas não dão bônus de XP; não
exibir +50/+250 herdados do rascunho. Eventual bônus precisa regra idempotente e
novo contrato antes de ativar.

Tocar medalha abre detalhe acessível (modal simples ou expansão da própria
linha, decisão de implementação): nome, descrição, como obter, progresso e data.
Escolher uma única apresentação comum com Perfil. Não depender de hover.

## Estados e efeitos

Carregando, pronto sem progresso, parcial, meta atingida, sem catálogo publicado,
erro de progresso com repetir. Nenhum loading/erro redefine XP para zero.
Animação opcional de conquista só quando evento novo, nunca ao reabrir screen.
Conquistas não são compráveis, resgatáveis nem ranking; não há loja/prêmio físico.
Offline usa histórico local, sem prometer backup. Dados demo não desbloqueiam.

## Implementação e critérios de aceite

View model compartilhado `ProgressSummary`, `AchievementCard` e `ProgressBar`.
Selectors fora da tela. Não duplicar cálculos em cada route nem criar incremento
em useEffect de montagem. Recalcular ao focar/depois de alteração persistida.

- RE01: XP/nível/sequência/conquistas iguais aos do Perfil e Quiz.
- RE02: zero e limiares 499/500/501/2150 produzem barra, nível e faltante coerentes.
- RE03: bloqueada não tem data, conquistada não muda data ao reabrir.
- RE04: grid e detalhes são legíveis em tela estreita e fonte 200%.
- RE05: Voltar/aba Perfil não geram eventos nem telas duplicadas.
- RE06: não há recompensa material, estado clínico ou bônus não implementado.

Jest para cálculo/limiares; RNTL para estado/detalhes; Maestro para consistência
com histórico de quiz. Pendente: aprovação de regra de XP, catálogo e nomes.
