# PRD-015 — Central de notificações dentro do app

**Estado atual:** Não implementado como funcionalidade.

Central interna, armazenamento e integração com notificações ainda pendentes;
não há serviço de notificações nativas implementado. O [índice de PRDs](../README.md)
consolida o estado atual.

Versão 2 — 27/10/2026. Documento reconstituído na organização dos PRDs, conferido
com `Notifications.tsx` do Figma Make e os contratos atuais do aplicativo.
Prioridade P4, após lembretes e progresso. Rota proposta: `app/notifications.tsx`,
apresentada como modal do Stack, sem criar uma sexta aba.
Contrato: [PRD-003](../implementados/PRD-003-sistema-visual.md).

## Objetivo e composição

Consultar avisos internos e distinguir itens novos de lidos, preservando a identidade
do Figma Make. O protótipo contém cinco avisos fixos e ações sem persistência;
eles são referência visual, não eventos reais a importar para o aplicativo.

Painel branco com raio 32, largura máxima 672, margens laterais 16 e safe area.
Cabeçalho gradiente `#1565C0` → `#42A5F5`, padding 24, sino em caixa 48/16,
título `Notificações` 24/700, contagem derivada de não lidas e botão Fechar.
Lista rolável com linhas de padding 20, divisórias claras, ícone 48/16 em gradiente,
título em negrito, mensagem 14, data 12 e indicador azul de item não lido.
Rodapé com `Marcar todas como lidas`. Adaptar altura ao espaço disponível e texto
ampliado; não fixar 85vh nem depender de backdrop-filter ou DOM.

Ações com área mínima 48, nomes acessíveis e leitura ordenada. Indicador de não
lida deve ter descrição textual/acessível, sem depender somente da cor. Gradientes,
contraste e comportamento de movimento seguem o PRD-003.

## Dados e limites

Usar `AppNotification` e `NotificationRepository` de `src/services/contracts.ts`:
`id`, `type` (`achievement`, `information`, `reminder`), `title`, `message`,
`createdAt`, `readAt?`, `isDemo` e `target?` com tipo/ID de destino.
`list()` carrega itens; `markRead(ids)` grava leitura de forma idempotente.
O armazenamento ainda não foi escolhido nem implementado.

Ordenar por data decrescente com desempate estável por ID. Datas devem vir de
instantes válidos; apresentar no fuso local e não copiar textos fixos como
`5 min atrás` do protótipo. Contagem considera apenas itens sem `readAt`.
Não inventar conquistas, XP, campanhas abertas ou alertas regionais. Avisos
informativos reais precisam de origem/revisão editorial. Fixtures demo devem ser
identificadas e isoladas dos eventos reais e do progresso.

Central interna e entrega de notificações pelo Android são funcionalidades
separadas: abrir o painel não pede permissão de notificação. Não afirmar que a
central garante entrega em segundo plano. Integração futura de lembretes deve
seguir [PRD-010](PRD-010-lembretes.md) e [PRD-011](PRD-011-lembrete-formulario.md).
Conteúdo de saúde sensível não deve aparecer em notificação externa.

## Interações e estados

Abrir a partir de um controle explícito de notificações quando a funcionalidade
estiver disponível. Fechar, Back e gesto de modal retornam ao destino anterior,
preservando filtro/scroll quando aplicável. Link direto sem origem oferece Início.

Mostrar carregamento, lista pronta, vazio `Nenhuma notificação por enquanto` e
erro com `Tentar novamente`. Falha ao carregar não equivale a lista vazia nem
contagem zero. Não exibir badges fabricados na ausência de repositório.

Ao selecionar um item, marcar leitura e abrir apenas destinos internos conhecidos
por tipo/ID. Item sem destino apresenta informação sem chevron de navegação.
Destino removido/inválido informa indisponibilidade e permite voltar. Não abrir
URLs arbitrárias recebidas no payload.

`Marcar todas como lidas` opera os IDs não lidos carregados e fica desabilitado
sem itens elegíveis ou enquanto grava. Novos itens recebidos durante a operação
permanecem não lidos. Atualizar contagem após sucesso; falha preserva estado
anterior e oferece nova tentativa. Evitar toques repetidos/gravações concorrentes.
Não marcar automaticamente todas ao abrir o modal.

## Implementação e testes

Separar repositório, estado e apresentação. Persistir leitura antes de apresentá-la
como concluída, ou implementar rollback explícito se for escolhida atualização
otimista. Falhas de gravação devem ser visíveis e recuperáveis. Limpar assinaturas
e não atualizar tela desmontada. Não portar motion/Radix nem dependências web.

Jest para contagem, ordenação, datas e idempotência; RNTL para estados, falha de
leitura, ação em lote, destinos inválidos e retorno. Maestro: abrir → ler → voltar
→ marcar todas → fechar → reabrir, em build Android com persistência real.
Validar offline, reinício, TalkBack e fonte 200% no aparelho.

## Critérios de aceite

- NT01: modal preserva hierarquia, cores e layout responsivo do Figma Make.
- NT02: lista e contador derivam do mesmo repositório; vazio e erro são distintos.
- NT03: leitura individual/em lote persiste e não duplica efeitos.
- NT04: falha de gravação não apresenta leitura como confirmada.
- NT05: destino válido navega; destino ausente/inválido oferece recuperação.
- NT06: abrir a central não solicita permissão nem promete notificação externa.
- NT07: nenhum evento demo concede progresso ou simula alerta de saúde atual.
- NT08: fechamento e reabertura mantêm estado e acesso por tecnologias assistivas.

Pendentes: fontes dos avisos informativos, armazenamento, retenção/exclusão,
integração com histórico e decisões de produto para avisos externos. Este PRD é
uma proposta de implementação, sem backend ou push definidos.
