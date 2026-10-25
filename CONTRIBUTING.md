# Contributing

## Quality rule

Every functional change needs a test. Use the smallest test level that proves the behavior:

- Pure functions: unit test.
- Components and screen states: React Native Testing Library test.
- Navigation, permissions, or native integration: Maestro flow in `.maestro/`.

Before opening a pull request, run:

```bash
npm run validate
```

CI runs the same checks and requires at least 70% global coverage. Increase this target over time; do not lower it to merge a change.

## Conventions

- Keep tests in `tests/` and use `.test.ts` or `.test.tsx` in the filename. Do not put test files in `app/`, because Expo Router treats that folder as application routes.
- Test observable behavior, accessibility, and user flows. Avoid testing internal implementation details.
- Use `testID` only when text, role, or accessibility label cannot identify an element in Maestro.
- Never commit `.env` files, credentials, signing certificates, or store keys.
- Keep pull requests small and focused. Explain the behavior change and the tests added.
