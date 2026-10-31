# PRD-010 — Lembretes: lista, ações e exclusão

**Estado atual:** Parcialmente implementado — CRUD local, contadores, mensagens iniciais, persistência versionada e agendamento de alertas (30 min antes e no horário) entregues; pendentes comprovação de alarmes em background em build nativa/aparelho Android, Maestro e revisão visual/acessibilidade.

Lista funcional em `app/(tabs)/reminders.tsx`, cards com marcação/desfazer do dia, ativar/pausar, editar e excluir com confirmação, repositório local serializado (`AsyncStorage` não criptografado) e serviço de notificações locais (`expo-notifications` no nativo e fallback em primeiro plano na web) conectados. Consulte [a validação local](../../validation/PRD-010-011-validacao.md).

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P2; notificações nativas em incremento próprio.
Origem: `Reminders.tsx` e `RemindersContext.tsx`.
Rota: `app/(tabs)/reminders.tsx`; feature `reminders`.
Dependências: [PRD-003](../implementados/PRD-003-sistema-visual.md), [PRD-011](PRD-011-lembrete-formulario.md).

## Objetivo e limites

Organizar lembretes pessoais com um horário por registro e dias da semana.
Não é prescrição, histórico completo de doses ou recomendação de uso. Lista inicia
vazia, sem medicamentos fictícios. Usuário abre → cria → vê card → marca/desfaz,
pausa/reativa, edita ou exclui. Cada ação só comunica sucesso após persistência.

## Layout de referência

Header gradiente #1565C0 → #1976D2 → #42A5F5, margens 24, ícone de sino e título
Lembretes. Três pequenos cards translúcidos: Total, Ativos, Tomados hoje, valores
24/700 calculados. Banner âmbar de permissão sobre a transição do header, sem
ocultar título. Corpo espaçado com blocos brancos, azul claro e aviso existente.
Textos web devem dizer `neste aparelho`, não `neste navegador`.

Explicação breve de armazenamento local; instruções de uso; atalho Água em ciano
claro com gota 32 e ação +; cards brancos raio 24, ícone em caixa 48/16 com
variante de cor estável por ID (não posição na lista), nome 16/700, descrição 12,
horário em pill azul, próximo horário e dias Dom–Sáb. Notas aparecem com acesso
ao texto completo ao editar; nome não pode ficar irrecuperável por truncamento.

Ações Tomei/desfazer, pausar/ativar, editar e remover têm alvos >=48. Em tela
estreita podem ir a segunda linha em vez de esmagar texto. Card tomado tem
borda verde e texto `Tomado hoje`; pausado indica `Pausado`, sem reduzir opacidade
de todo texto a ponto de perder contraste. CTA `Adicionar lembrete` fixo acima
das abas, gradiente azul, raio 32, altura >=56. Lista reserva espaço real para ele.
Toast não deve cobrir CTA/tab bar; mensagens críticas permanecem inline.

## Dados e operações

Reutilizar `src/domain/reminders.ts`: Reminder, datas locais, horários, recorrência,
serialização versionada. Gerar ID fora da UI com API nativa testável. Total =
registros salvos; Ativos = active; Tomados hoje = takenDate igual à data local,
inclusive se pausados depois de registrar. Não contar registros de ontem.
Marcar só se ativo e agendado hoje. Desfazer registro de hoje deve continuar
acessível mesmo se usuário o pausou depois: correção intencional de limitação
potencial do protótipo. Desfazer não apaga histórico porque o modelo só tem a
última data, e não deve disparar novamente alerta já emitido no mesmo horário.

Ordem inicial: mais recentes primeiro, conforme inserção do protótipo; editar não
reordena. Não ordenar visualmente pela contagem a cada minuto. Contagem deriva
da recorrência local, não de prescrição. Pausado não tem próximo alerta ativo.
Ao foreground/virada do dia recalcular datas e próximos horários. Não usar polling
web a cada segundo como mecanismo de notificação em background.

Pausa cancela agendamentos futuros; reativação agenda ocorrências posteriores.
Edição cancela substituídos, exclusão cancela todos do registro. Guardar IDs de
agendamentos em serviço separado do objeto de domínio; tratar falhas como estado
`Salvo no aparelho; aviso não agendado` e permitir repetir, sem duplicar notificação.
Não desfazer uma gravação válida apenas para ocultar erro de agendamento.

## Permissão e armazenamento

Ações Ativar avisos, permissão concedida, negada, indisponível e agendamento com
erro são estados distintos. Solicitar permissão somente pelo botão. Negada leva
às configurações se suportado; nunca repetir prompt automaticamente.
Não bloquear CRUD por permissão negada. Exibir texto externo genérico `InfoVida:
lembrete agendado. Abra o aplicativo para consultar seus lembretes.` Sem nome,
dose ou observação na tela bloqueada.

Persistência assíncrona precisa de fila de operações/controle de versão para não
perder atualização; erro de leitura não vira lista vazia pronta para sobrescrever.
Dados inválidos são preservados e ações de escrita ficam bloqueadas até recuperação.
Falha de gravação mantém estado anterior e mostra erro acionável.

## Exclusão, estados e recuperação

ConfirmDialog branco raio 24: `Remover lembrete?`, nome e descrição da remoção
local; Cancelar e Confirmar remoção (vermelho). Voltar fecha sem remover. Loading
bloqueia repetição; erro mantém diálogo e dados, sem toast de sucesso.

Lista: carregando, vazia (`Nenhum lembrete ainda` + CTA), pronta, falha de leitura,
corrompida, gravação em curso/erro, aviso pendente. Água abre formulário com nome
Água, 08:00 e todos os dias, **sem gravar**. Não dar lembretes medicamentosos de
exemplo por padrão. Não exibir instrução genérica para tomar dose esquecida:
conteúdo do protótipo depende de revisão específica, fora da regra do aplicativo.

## Implementação e critérios de aceite

FlatList/ReminderCard, repositório local versionado e serviço de notificação
planejados. Escolher armazenamento após avaliar privacidade/backup dos dados;
não presumir AsyncStorage criptografado. Expo notifications exige testes na
build e aparelho antes de prometer avisos com app fechado. Sem push remoto.

- LE01: criar/navegar/reiniciar mantém registro; offline não impede CRUD local.
- LE02: total/ativos/tomados derivam dos mesmos registros e mudam na data local.
- LE03: operações rápidas não perdem alterações nem duplicam registros/avisos.
- LE04: erro de storage não informa sucesso e preserva dados existentes.
- LE05: permissão negada mantém cadastro; falha de agenda tem estado visível.
- LE06: exclusão pede confirmação; pausar/editar/excluir atualiza agenda correspondente.
- LE07: nenhum dado sensível aparece em alerta externo, log ou telemetria.
- LE08: registrar, pausar e desfazer hoje funciona sem criar dose duplicada.

Jest: domínio e serviços com relógio/agenda mockados. RNTL: ações/erros/diálogo.
Maestro: CRUD, reinício, permissão negada; teste de notificação em aparelho/build
separado de Expo Go. Pendente: biblioteca de storage, política de retenção e
comportamento comprovado de agenda sob restrições Android.

## Registro de implementação — 31/10/2026

- Aba `app/(tabs)/reminders.tsx` conectada a `RemindersScreen`, `ReminderCard` e `RemindersProvider`, com cabeçalho `Lembretes de Medicamentos`, contadores derivados (`Total`, `Ativos`, `Tomados hoje`), banner de ativação/estado de notificações, alerta clínico de atenção e guia `Como usar esta tela:`.
- Persistência local versionada (`infovida.reminders.v1`) implementada em `localReminderRepository.ts` sobre `@react-native-async-storage/async-storage` (armazenamento privado do app, não criptografado), com fila FIFO serializada, inserção mais recente primeiro, edição sem reordenar e bloqueio seguro diante de dados corrompidos.
- Notificações locais implementadas em `reminderNotifications.ts` via `expo-notifications` (Android/iOS) e fallback em primeiro plano na web: cada lembrete ativo agenda dois alertas — **30 minutos antes** (com recuo correto de dia na virada da meia-noite) e **no horário exato** — usando textos externos genéricos sem expor nome do medicamento, dosagem ou observações (`LE07`). IDs de agendamento ficam separados em `infovida.reminders.schedules.v1`.
- Marcação `Tomado hoje` e opção de desfazer permanecem acessíveis mesmo quando o lembrete é pausado em seguida (`LE08`). Exclusão exige `ConfirmDialog` (`LE06`).
- Limites atuais: entrega em segundo plano com app fechado depende de build nativa e verificação em aparelho físico Android/iOS sob políticas de bateria do sistema; revisão visual, TalkBack, `fontScale` 200% e execução Maestro em emulador/aparelho permanecem pendentes.
