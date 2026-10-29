# PRD-012 — Emergência e acesso a contatos

**Estado atual:** Não implementado como funcionalidade.

A aba possui somente apresentação provisória. Contatos, discador e orientações com revisão editorial ainda precisam ser implementados.

Os registros datados abaixo preservam o contexto de cada etapa. O [índice de PRDs](../README.md) consolida o estado atual.

Versão 1 — 27/10/2026. Prioridade P2; textos educativos dependem de revisão.
Origem: `Emergency.tsx`; `app/(tabs)/emergency.tsx`, feature `emergency`.
Contrato visual: [PRD-003](../implementados/PRD-003-sistema-visual.md).

## Objetivo e composição

Dar acesso rápido a contatos e conteúdo educativo estático revisado, sem login
ou API. Não fazer triagem automatizada. Identidade vermelha do protótipo mantida.

Header #EF4444 → #DC2626 → #B91C1C, padding 24, ícone AlertTriangle em caixa
64/24, título `Emergências` 30/700, apoio `Ajuda rápida quando você precisa`.
Bloco translúcido com mensagem editorial curta de acesso à ajuda; conteúdo final
requer responsável de revisão, sem inserir aconselhamento novo neste PRD.

Corpo margem 24, espaçamento 24: Contatos de Emergência; seção de alertas;
Primeiros Socorros em accordions; card final azul/ciano de apoio, como a origem.
Contatos são cards brancos raio 24/padding 20, ícone 32 em caixa 64/16,
nome 18/700, descrição 14, número 20/700 em botão gradiente. Em tela estreita,
botão vai para linha inferior para preservar nome e alvo. Paleta por serviço:
SAMU vermelho, Bombeiros laranja, Polícia azul, CVV violeta, conforme dados da
origem. Barra inferior mantém ícone/label Emergência vermelhos e estado ativo.

Lista original de referência: SAMU 192, Bombeiros 193, Polícia 190 e CVV 188.
Esses números são inventário da exportação, não validação editorial deste PRD;
confirmar fontes oficiais e descrições antes de disponibilizar botão funcional.
CVV deve ter descrição própria de apoio emocional, sem ser confundido com resgate.

## Ações, conteúdo e dados

Contato abre **discador** com número preenchido por `Linking.openURL('tel:...')`;
não solicitar permissão para realizar chamada direta nem discar automaticamente.
Texto acessível `Abrir discador: [serviço], [número]`. Quando indisponível, mostrar
número selecionável e `Não foi possível abrir o discador neste aparelho`.
Rejeição do sistema não é tratada como chamada efetuada. Não registrar chamada,
localização ou dado pessoal. Testes sempre mockam serviço, sem chamar emergência.

Modelo `EmergencyContact {id, name, number, description, colors, reviewedAt,
sourceUrl}`; conteúdo local versionado com metadados de revisão. Alertas e
primeiros socorros do protótipo são rascunho. Antes de aprovação, manter títulos
com `Conteúdo em revisão`, sem expor instruções operacionais não validadas.
Não inventar alerta de surto/região do usuário. Não pedir geolocalização.

Accordions de referência: Engasgo, Queimadura, Desmaio e Convulsão. Cabeçalho com
emoji, título e seta; abre um por vez, fecha ao tocar de novo. Expandido possui
ilustrações/legendas e passos numerados somente se aprovados. Expansão não move
foco inesperadamente nem inicia mídia/áudio. Ao abrir conteúdo perto do final,
permitir rolagem para leitura integral. Não animar indefinidamente o aviso vermelho.

## Estados e adaptação

Contato validado pronto, contato pendente (botão indisponível com justificativa),
conteúdo em revisão, accordion fechado/aberto, discador abrindo e falha do sistema.
Conteúdo publicado embarcado funciona offline; acesso a telefonia depende do
aparelho/serviço e não de promessa do app. Erro em conteúdo não remove contatos
já validados. Não usar spinner global que esconda número em urgência.

ScrollView/lista finita com contatos e seções; accordions acessíveis com expanded.
Preservar tokens de alerta e ordem das seções, ampliar grid de sintomas para uma
coluna quando necessário. Footer respeita tab bar e safe area.

## Critérios de aceite e testes

- EM01: contatos aprovados são acessíveis sem conta/rede e mantêm identificação.
- EM02: tocar contato solicita apenas abertura do discador com número correto.
- EM03: app não assume que houve ligação e oferece recuperação se abertura falhar.
- EM04: nenhum texto de primeiros socorros pendente aparece como aprovado.
- EM05: accordion abre/fecha por toque/teclado/assistência e conserva conteúdo legível.
- EM06: barra inferior não cobre botão de contato nem última seção.

RNTL: mocked Linking, erro e accordion. Maestro: layout/expansão com chamadas
mockadas/desativadas no build de teste. Revisão editorial e visual são gates
separados. Pendente: responsáveis, fontes oficiais, datas de revisão e aprovação
do conteúdo; este documento especifica software, não valida procedimentos médicos.
