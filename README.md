# InfoVida

A starter project for React Native with **Expo SDK 58**, TypeScript, Expo Router, automated tests, and GitHub Actions CI/CD.

## Requirements

- Node.js 22.13 or newer.
- An Expo account for cloud builds.

## Get started

Run these commands once after cloning the repository:

```bash
cp .env.example .env
npm install
npx expo install --fix
npm run validate
npm start
```

`npm install` downloads packages and creates `package-lock.json`. Commit that file. After it exists, use `npm ci` for clean, repeatable installs locally and in CI.

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
