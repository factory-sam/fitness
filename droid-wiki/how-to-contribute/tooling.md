# Tooling

## ESLint

Configuration: `eslint.config.mjs`

ESLint uses the flat config format with the following rule sets:

- **next/core-web-vitals** and **next/typescript** — Next.js-specific checks.
- **@typescript-eslint/naming-convention** — enforces camelCase for variables and PascalCase for types.
- **complexity** — maximum cyclomatic complexity of 15 per function.
- **max-lines** — maximum 400 lines per file.
- **no-warning-comments** — flags TODO and FIXME comments as warnings so they don't accumulate silently.

Run manually:

```bash
pnpm lint
```

## Prettier

Configuration: `.prettierrc`

Prettier handles all code formatting. It runs automatically on staged files via the pre-commit hook, so committed code is always formatted consistently.

Run manually:

```bash
pnpm format
```

## Husky + lint-staged

Husky installs Git hooks. The `pre-commit` hook runs lint-staged, which:

1. Runs Prettier on all staged files.
2. Runs ESLint on staged `.ts` and `.tsx` files.

If either step fails, the commit is blocked.

## Knip

Configuration: `knip.config.ts`

[Knip](https://knip.dev/) detects unused files, dependencies, and exports. Run it to find dead code:

```bash
pnpm knip
```

## jscpd

Configuration: `.jscpd.json`

[jscpd](https://github.com/kucherenko/jscpd) detects copy-pasted code blocks. Run it to find duplicated logic that should be extracted into shared functions or components.

## Vitest

Configuration: `vitest.config.ts`

Vitest runs the unit test suite. Coverage thresholds are set at 50% statements. See [Testing](./testing.md) for details on existing tests and how to write new ones.

```bash
pnpm test
```
