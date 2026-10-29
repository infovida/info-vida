# PRD-011 — Formulário de criação e edição de lembrete

**Estado atual:** Não implementado como funcionalidade.

Formulário, rotas de criação/edição, persistência e integração de agendamento ainda precisam ser implementados; validação de domínio já existe.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P2.
Origem: ReminderForm em `Reminders.tsx`.
Rota proposta: `app/reminders/editor.tsx`, apresentação modal no Stack.
Dependências: [PRD-003](../implementados/PRD-003-sistema-visual.md), [PRD-010](PRD-010-lembretes.md).

## Objetivo e layout

Cadastrar/editar um registro com horário e dias escolhidos, sem sugerir
medicamentos ou doses. Modal branco raio 24, margens 16 quando couber,
título 24/700 `Novo lembrete` ou `Editar lembrete`, apoio 14. Em tela pequena ou
teclado ativo, ocupar área útil e rolar; não preservar limite de 90vh da web.
Sem tab bar por trás da área de edição. Fechar/Voltar sempre acessível.

Campos na ordem original: nome, dosagem, horário, dias, atalhos de dias,
observações, informação de uso revisada, erro se houver e Salvar lembrete.
Labels 14/700, valores 16, horário 18/700. Inputs borda 2 cinza, foco azul,
padding 16, raio 16, fundo branco. Ícones Pill/Clock à esquerda quando cabíveis.
Dias em chips azuis selecionados/cinzas não selecionados, inicialmente sete
colunas se alvos 48 couberem; caso contrário quebrar linhas. CTA gradiente azul,
raio 32/altura >=56. Não deixar teclado sobre o botão/campo focado.

## Campos e validação

| Campo | Regra e padrão |
| --- | --- |
| Nome | obrigatório, trim, 1–120 caracteres; vazio inicialmente |
| Dosagem | opcional, até 160, texto livre; não interpretar nem calcular |
| Horário | obrigatório, HH:mm 24h válido; padrão 08:00 |
| Dias | ao menos 1, inteiros únicos 0=Dom a 6=Sáb; padrão todos |
| Observações | opcional, até 500, multiline; vazio inicialmente |
| Estado ativo | true no novo; edição preserva valor atual |

Proposta de placeholder neutro `Nome do seu lembrete` e `Conforme sua orientação
de uso`, evitando nomes/doses reais como sugestão. Dosagem vazia é armazenada
vazia, exibida como `Sem dosagem informada` na lista; não confundir apresentação
com valor digitado. Atalhos Dias úteis=[1..5], Todos=[0..6], Fins de semana=[0,6].
Seletor de hora nativo compatível com Expo ou entrada validada; biblioteca e
versão serão escolhidas na implementação. Não usar input type=time de HTML.

Salvar valida localmente e com `isReminder`/codec antes de persistir. Mostrar
erro junto ao campo e mover foco para o primeiro inválido; resumo acessível
quando necessário. Mensagens: `Informe o nome do lembrete`, `Informe um horário
válido`, `Selecione ao menos um dia da semana` e limites respectivos.
Campos não são apagados em erro. Edição preserva ID, takenDate e marcador de
alerta; datas passadas não são apagadas para simular novo lembrete. Mesmo nome
pode existir em horários distintos; não fazer deduplicação por nome.

## Fluxos e efeitos

Novo inicia vazio com padrões; Água preenche somente nome/horário/dias.
Editar busca por ID; se inexistente, mensagem e retorno à lista, sem criar outro.
Salvar ocupa CTA e impede toque duplicado. Persistência bem-sucedida fecha modal
e atualiza lista; falha mantém formulário e erro. Se registro foi salvo e só
agenda falhou, retornar com aviso de agendamento conforme PRD-010.

Ao alterar campos e fechar/Back, confirmar `Descartar alterações?` com
Continuar editando / Descartar; sem mudança, fechar direto. Uma ação de save
em curso não pode descartar silenciosamente a operação. Novo ID é gerado uma vez
por tentativa de criação; repetir save por falha não cria outro registro.

Texto de orientação desta fase: `Preencha conforme a orientação que você já
recebeu do profissional de saúde.` Não copiar a recomendação genérica sobre dose
esquecida como instrução automatizada; não oferecer cálculo de tratamento.

## Estados e aceite

Estados: novo/Água/edição, carregando ID, ID ausente, alterado, inválido, salvando,
erro de storage e salvo com agenda pendente. Formulário não depende de internet.
Nome e notes não vão para URL, logs, analytics ou título de notificação externa.

- LF01: padrões são consistentes; abrir Água e cancelar não cria registro.
- LF02: zero dias, nome em branco e hora inválida impedem save com mensagem.
- LF03: limites são respeitados sem truncar silenciosamente dados já salvos.
- LF04: salvar duas vezes rapidamente grava uma vez; falha preserva edição.
- LF05: editar mantém identidade/estado e atualiza só campos permitidos.
- LF06: teclado e fonte ampliada não escondem campos, mensagens ou fechar.
- LF07: leitor de tela anuncia label, obrigatório, seleção e erro de cada campo.
- LF08: descarte confirmado preserva versão anterior do registro.

Jest: validação e preservação de campos; RNTL: entrada/erros/save/cancelamento;
Maestro: criar, editar e testar teclado real. Pendente: escolha de persistência
e seletor de hora; várias doses por registro são evolução de domínio/PRD.
