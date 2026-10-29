# Validação — PRD-004: Entrada

Data: 27/10/2026. Alterações locais, sem commit, PR ou publicação.

## Implementação verificável

Rota `/` agora apresenta WelcomeScreen. Usa os assets da exportação Figma Make
para PET-TECHSUS, UNIFAL-MG e Ministério da Saúde. Não carrega imagens de rede.
O botão Começar abre `/home` e remove a entrada do histórico. Não há formulário
nem credencial fictícia. As abas permanecem as implementadas no PRD-003.

O componente de botão compartilhado ganhou tamanho large (18 sp/700) sem mudar
o padrão dos botões existentes. A entrada tem SafeAreaView, ScrollView flexível,
limite de largura e mudança para rodapé em coluna quando o texto está ampliado.
Na falha de imagem, a identificação textual preserva o espaço mínimo e pode crescer.

## Verificações automatizadas

- Lint, TypeScript e suíte Jest/Expo com cobertura mínima global de 70%.
- Router real: primeira rota mostra entrada sem abas; Começar leva à Home sem
  histórico para retornar à entrada; navegação entre abas e rota inválida continuam.
- Quatro testes novos: identidade/assets/CTA único, falha de imagem, erro de
  navegação com repetição e renderização/ação em 360×800/fontScale 2 simulado.
- O teste de fonte ampliada verifica que conteúdo/ação continuam disponíveis no
  renderer de teste; não prova posição, ausência de corte ou medidas físicas.
- Bundle Metro de Android e web para validar imports e empacotamento de assets.
- git diff --check e links locais da documentação.

`npm run validate` passou: lint sem warnings, TypeScript sem erros e 32 testes
em 7 suítes. Cobertura global: 94,08% statements, 90,86% branches, 93,33%
functions e 97,5% lines (mínimo preservado em 70%).
Smoke Maestro foi atualizado com reinício do processo, entrada e CTA; não foi
executado em aparelho/emulador nesta etapa e não limpa dados do aplicativo.

## Aceite que depende do Android

Conferir aparência do gradiente, proporções dos logos, safe areas, rolagem em
360×800/fontScale 200%, TalkBack e aparência/retorno da status bar. A infraestrutura
local de navegador já apresentou restrição de sandbox no PRD-003; não há captura
visual aprovada nesta entrega. A inspeção das três imagens originais foi feita,
mas não substitui comparação da tela renderizada com o protótipo.

## Como testar

Na pasta InfoVida, iniciar `npx expo start --go --clear`. Fechar a sessão antiga do
Expo Go e reabrir pelo QR code. Ver a entrada com InfoVida, slogan, três logos e
Começar. Tocar Começar abre as cinco abas; Voltar não deve reinserir a entrada.
Reabrir o processo mostra novamente a apresentação, sem preferência persistida
de pular a tela. O feed de notícias é o próximo PRD e continua em preparação.

## Empacotamento concluído

Exportação Android (Hermes) e web passou com os assets da entrada:
`CI=1 EXPO_OFFLINE=1 npx expo export --platform android --platform web --output-dir /tmp/infovida-prd004-bundles --max-workers 2`.
Saída ficou em /tmp, fora do Git. Não é APK nem comprovação de aparência ou
execução nativa. Não foram adicionadas dependências. Links locais e
`git diff --check` passaram.
