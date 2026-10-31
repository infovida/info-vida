# Validação local — PRDs 010 e 011: lembretes e formulário CRUD

Data: 31/10/2026. Alterações locais na branch `feature/lembretes`, sem commit, push, PR ou publicação.

## Escopo entregue

- **Tela principal de lembretes (`app/(tabs)/reminders.tsx` → `src/features/reminders/RemindersScreen.tsx`):**
  - Cabeçalho em gradiente (`gradients.reminders`) com ícone `pill`, título `Lembretes de Medicamentos`, subtítulo `Acompanhe seus horários de forma simples` e três cartões translúcidos com valores calculados em tempo real: **Total**, **Ativos** e **Tomados hoje** (botão `+` do cabeçalho removido conforme solicitação de design).
  - Mensagens iniciais alinhadas à referência visual:
    1. Banner âmbar de ativação de notificações unificado para permissão indeterminada ou negada (`Ative as notificações para receber alertas no horário do seu remédio.` + botão `Ativar`), além de estados específicos para notificações ativas (com opção `Pausar`), ambiente indisponível e erro de agendamento (`Repetir`).
    2. Card vermelho de orientação clínica (`Atenção: Não altere doses, não interrompa tratamentos e não combine medicamentos sem orientação do seu médico ou farmacêutico.`).
    3. Seção **Adicionar rápido** com card de sugestão rápida de **Água 💧** (08:00, todos os dias, 1 a 2 copos de água, Beber pelo menos 2 litros de água por dia) que cria e salva automaticamente o lembrete com um toque.
    4. Card azul informativo `Como usar esta tela:` explicando as ações de marcar `✓ Tomei`, ativar/pausar no sino, editar/remover e criar via `+ Adicionar lembrete`.
  - Lista inicia vazia (`Nenhum lembrete ainda`), sem medicamentos fictícios pré-cadastrados.
  - Cards (`ReminderCard.tsx`) com variante de cor estável derivada do `id`, nome com indicador ativo, dosagem (`Sem dosagem informada` quando vazia), pill de horário `HH:mm`, contagem regressiva (`em Xh Ymin`, `Tomado hoje` ou `Pausado`), badges dos dias `Dom`–`Sáb`, bloco de observações e botões circulares acessíveis (`>= 48 × 48 dp`) para marcar/desfazer tomado no dia, pausar/reativar, editar e remover (com `ConfirmDialog`).
  - Desfazer o registro `Tomado hoje` continua acessível mesmo se o lembrete for pausado logo após a marcação (`LE08`).
  - Botão fixo `+ Adicionar lembrete` acima da barra de abas mantido, integrado diretamente ao fundo da tela (sem container com fundo branco).
  - Remoção de toasts/notificações efêmeras em todas as ações de lembretes (criação, edição, exclusão, marcar/desfazer tomado hoje e ativar/pausar), mantendo apenas as atualizações visuais imediatas nos cards e estado do app.

- **Formulário modal de criação e edição (`app/reminders/editor.tsx` → `src/features/reminders/ReminderEditorScreen.tsx`):**
  - Apresentado como modal no Stack raiz (sem tab bar inferior), com `KeyboardAvoidingView` e rolagem completa.
  - Campos na ordem solicitada: **Nome do medicamento** (obrigatório, 1–120 caracteres), **Dosagem** (opcional, até 160 caracteres), **Horário para tomar** (`HH:mm` 24h, com entrada validada, ajustes `-15m`/`+15m` e horários rápidos `08:00`, `12:00`, `18:00`, `20:00`), **Dias da semana** (`Dom`–`Sáb`) com botões de atalho (**Todos os dias**, **Dias úteis**, **Fins de semana**), chave **Notificações deste lembrete** (alertas 30 min antes e na hora) e campo final de **Observações** (multiline, até 500 caracteres).
  - Validação por campo com foco no primeiro inválido, bloqueio de toque duplicado (`LF04`), preservação de `id`/`takenDate`/`notifiedAt` ao editar (`LF05`), suporte ao preset `water` sem gravação automática (`LF01`), recuperação para `id` inexistente e confirmação `Descartar alterações?` ao fechar ou voltar (`LF08`).

- **Persistência local e notificações (`localReminderRepository.ts` e `reminderNotifications.ts`):**
  - Armazenamento versionado (`infovida.reminders.v1`) sobre `@react-native-async-storage/async-storage` (privado do app, não criptografado), com fila FIFO serializada (`LE03`), inserção mais recente primeiro, edição sem reordenar e preservação integral diante de dados corrompidos (`LE04`).
  - Agendamento local via `expo-notifications` (Android/iOS) e verificação em primeiro plano na web: cada lembrete ativo agenda **dois alertas** — **30 minutos antes** (tratando virada de meia-noite e dia da semana anterior) e **no horário exato** — com textos externos genéricos sem expor nome do medicamento, dosagem ou observações na tela bloqueada (`LE07`). IDs de agendamento do SO ficam isolados em `infovida.reminders.schedules.v1`.
  - Oito novos ícones Lucide (`pill`, `bell-off`, `warning`, `check-circle`, `clock`, `alarm`, `trash`, `edit`) gerados localmente em `assets/icons/` sob a licença ISC/MIT já presente.

## Verificações executadas

- `npm run doctor` (`npx expo-doctor`): **20/20 verificações aprovadas** após adição de `@react-native-async-storage/async-storage` (`2.2.0`), `expo-notifications` (`~58.1.7`) e alinhamento dos patches do Expo SDK 58 via `npx expo install --fix`.
- `npm run validate`: ESLint sem avisos (`--max-warnings=0`), TypeScript (`tsc --noEmit`) sem erros e **74 testes em 14 suítes aprovados** (`86,69%` statements, `82,32%` branches, `85,51%` functions e `90,26%` lines — acima do mínimo global de 70%).
- Empacotamento Metro offline (`CI=1 EXPO_OFFLINE=1 npx expo export --platform android --platform web --output-dir /tmp/infovida-validacao-bundles --max-workers 2`): bundles Android Hermes (`.hbc`) e web exportados com sucesso fora do repositório.
- `git diff --check` e conferência de links relativos na documentação: aprovados sem erros.

## Pendências e limites

- **Notificações em segundo plano / app fechado:** `expo-notifications` está integrado para disparos locais diários/semanais (30 min antes e na hora), mas a entrega efetiva com aplicativo fechado sob restrições de bateria de fabricantes Android e em iOS exige build nativa compilada e teste em aparelho físico (Expo Go e exportação Metro não comprovam alarmes em background).
- **Armazenamento:** `AsyncStorage` utiliza armazenamento local privado do aplicativo sem criptografia em repouso; eventual exigência futura de criptografia ou política de retenção continua sujeita a decisão de produto.
- **Revisão em aparelho e E2E:** inspeção visual comparativa em aparelho Android, navegação com TalkBack, `fontScale` 200%, comportamento real de teclado e execução de `.maestro/smoke.yaml` em emulador/aparelho permanecem pendentes.
