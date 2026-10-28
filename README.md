# InfoVida

A starter project for React Native with **Expo SDK 58**, TypeScript, Expo Router, automated tests, and GitHub Actions CI/CD.

## Requirements

- Node.js 22.13 or newer.
- An Expo account for cloud builds.

## Get started

Run these commands after cloning the repository (the lockfile is already tracked):

```bash
cp .env.example .env
npm ci
npm run validate
npm start
```

Use `npm ci` for clean, repeatable installs locally and in CI. Change dependencies and regenerate the lockfile together in a reviewed change.

`npx expo install --fix` checks that every Expo package matches the installed SDK version. Run it after adding an Expo package or upgrading Expo.

`npm start` opens the Expo development server. From its terminal screen, press `a` for Android, `i` for iOS on macOS, or `w` for web.

## Main commands

| Command | What it does |
| --- | --- |
| `npm start` | Starts the Expo development server. |
| `npm run android` | Starts Expo and opens Android. |
| `npm run ios` | Starts Expo and opens iOS (macOS only). |
| `npm run web` | Starts the web version. |
| `npm run lint` | Finds code style problems and common mistakes. |
| `npm run typecheck` | Checks TypeScript without generating files. |
| `npm test` | Runs unit and component tests once. |
| `npm run test:watch` | Runs tests again when files change. |
| `npm run test:coverage` | Runs tests and creates a coverage report. |
| `npm run test:e2e:android` | Runs Maestro Android user flows on an installed app. |
| `npm run validate` | Runs lint, type checks, and coverage tests; this matches the main CI checks. |

## Testing strategy

- Use **Jest** for pure functions and small business rules.
- Use **React Native Testing Library** for components, screen states, and accessibility.
- Use **Maestro** for complete user journeys, navigation, permissions, and native integrations.

The first Maestro flow is [`.maestro/smoke.yaml`](.maestro/smoke.yaml). Install the app on an Android emulator or device, then run:

```bash
maestro test .maestro/smoke.yaml
```

Add a test whenever a feature changes. Choose the smallest test level that proves the behavior, then add a Maestro flow when the feature affects a real user journey.

## Build and release

This project uses EAS Build. First, log in and link the project:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Before the first distribution build, replace `com.example.infovida` in `app.json` with unique Android and iOS application identifiers.

Build from your terminal:

```bash
# Development build for emulator or device testing
npx eas-cli@latest build --platform android --profile development

# Internal Android or iOS build to share with testers
npx eas-cli@latest build --platform all --profile preview

# Store-ready build; it does not submit to stores automatically
npx eas-cli@latest build --platform all --profile production
```

The same profiles are defined in `eas.json`: `development`, `preview`, and `production`. Production builds automatically increment the remote build number.

## GitHub Actions

- **CI** runs on every pull request to `main` and every push to `main`. It runs Expo Doctor, lint, TypeScript, and tests with coverage.
- **E2E Android** runs on every pull request to `main`. It builds the Android app, starts an emulator, and runs Maestro flows.
- **Build EAS** is manual from the GitHub Actions page. It validates the project before requesting an Android and/or iOS EAS build. It never submits an app to a store.
- **Dependabot** opens weekly dependency update pull requests.

To allow GitHub to request EAS builds, create an Expo access token and save it as the `EXPO_TOKEN` repository secret at **Settings → Secrets and variables → Actions**.

Protect `main` in **Settings → Branches**. Require the **Quality, types, and tests** and **E2E Android** checks, require pull requests, and disable direct pushes.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. In short: add or update tests, run `npm run validate`, update Maestro flows when user journeys change, and never commit secrets.

## References

The test setup follows the official [Expo testing guide](https://docs.expo.dev/develop/unit-testing/). The routing structure uses [Expo Router](https://docs.expo.dev/router/introduction/), and cloud builds use [EAS](https://docs.expo.dev/eas/).

## Consolidação com o Figma Make

A base Expo/React Native e o histórico da equipe foram preservados. O protótipo
web é referência para a implementação nativa; suas dependências web não foram
adicionadas ao aplicativo.

- `src/domain/reminders.ts`: regras portadas de horários, recorrência e dados versionados.
- `src/domain/quiz.ts`: modelos, seleção sem repetição e correção de alternativas.
- `tests/`: testes das regras e da tela inicial, executados pela configuração Jest existente.
- `docs/reference/figma-make/`: artigos e perguntas em rascunho, com origem e atribuições.
- `assets/figma-make/`: imagens recebidas com o protótipo.
- [PRD de análise](docs/prd/implementados/PRD-001-consolidacao-infovida.md).
- [Registro de estabilização e validação](docs/prd/parcialmente-implementados/PRD-002-estabilizacao-base.md).

As regras ainda não estão ligadas a telas, persistência ou notificações nativas.
Os textos de saúde em rascunho precisam de revisão antes de publicação.
A fundação visual do PRD-003 e as cinco abas estão implementadas. As telas de
conteúdo serão entregues conforme os próximos PRDs; as áreas provisórias informam
que ainda estão em preparação.

## PRDs de implementação das telas

O [índice de telas](docs/prd/README.md) reúne a especificação visual
compartilhada e os PRDs de cada tela/estado do Figma Make, adaptados à base Expo.
Entrada, feed de notícias fictícias e leitura de artigo estão implementados.
Categorias, perguntas e resultado do Quiz estão disponíveis em demonstração.
Persistência de tentativas, conteúdo de saúde revisado e gamificação continuam pendentes.

## Testar a fundação visual no Android

```bash
npx expo start --go --clear
```

Abra no Expo Go da mesma rede Wi-Fi. Ao abrir uma nova sessão, aparece a entrada com a marca, os logos e o botão
Começar, que leva às cinco abas com as cores do Figma Make. Lembretes, emergência e perfil ainda são
áreas em preparação. A aba Quiz permite testar seis categorias e rodadas aleatórias. O Início contém seis notícias fictícias, filtros e leitura completa. Os demais
fluxos seguem os PRDs seguintes.
Nenhuma API ou credencial é necessária para esta visualização.


A tela de entrada usa somente imagens locais e não exige conta. Se o Fast Refresh
mantiver você nas abas durante o desenvolvimento, feche a sessão do Expo Go e
reabra pelo QR code para conferir a entrada. O botão Começar substitui a entrada
no histórico: Voltar nas abas não deve mostrar a entrada novamente.
Registro: [PRD-004](docs/prd/implementados/PRD-004-entrada.md).


## Feed e leitura de demonstração

A aba Início contém seis exemplos fictícios, nove filtros e duas ilustrações
locais. Toque em um card para ler o artigo; Voltar retorna ao filtro anterior.
Emergência e Infância ainda não têm exemplos e mostram um estado vazio.
Nenhuma notícia ou imagem é buscada por API nesta fase, e as leituras fictícias
não geram progresso. [Registro dos PRDs 005/006](docs/validation/PRD-005-006-validacao.md).


## Quiz de demonstração

Abra Quiz e escolha uma das seis categorias (três perguntas) ou Quiz Aleatório
(até cinco perguntas). Responda, leia a explicação e avance até o resultado.
As perguntas são exemplos sobre o uso do app e a leitura de informações,
sem orientações clínicas. Rodadas ficam apenas na memória e não geram XP,
conquistas ou sequência; reiniciar o app apaga essas sessões.
[Validação dos PRDs 007–009 em modo demo](docs/validation/PRD-007-009-demo-validacao.md).


## Organização dos PRDs e referência local

O [índice de PRDs](docs/prd/README.md) separa os documentos em
`implementados/`, `parcialmente-implementados/` e `nao-implementados/` e registra
as pendências de cada entrega. Uma aba provisória não significa funcionalidade
concluída; o quiz atual funciona em demonstração, sem progresso persistido.

A raiz Git é esta pasta `InfoVida`, mesmo quando fica dentro de outra pasta no
computador. Execute os comandos Git aqui: não é necessário mover o clone, criar
outro repositório ou enviar a pasta que o contém. No GitHub aparecerão `app/`,
`src/`, `docs/` etc. diretamente na raiz do repositório.

A exportação completa `../InfoVida_FigmaMake/` permanece apenas como referência
local fora deste Git. Os assets usados no app, atribuições e rascunhos extraídos
em `docs/reference/` acompanham o projeto; a exportação web completa não acompanha.
