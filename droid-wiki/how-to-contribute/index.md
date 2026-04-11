# How to contribute

Vitruvian is a single-developer project, but the contribution workflow is designed to scale. Every change goes through a pull request, automated checks, and AI-assisted code review.

## PR process

1. Branch from `main`.
2. Make your changes. Pre-commit hooks enforce formatting and linting automatically.
3. Push your branch and open a pull request.
4. Factory Droid reviews the PR automatically via the `droid-review.yml` GitHub Actions workflow.
5. Address any review feedback, then merge.

## Definition of done

A change is considered done when:

- All pre-commit hooks pass (Prettier formatting, ESLint linting).
- Unit tests pass (`pnpm test`) with coverage above the 50% statements threshold.
- The PR has been reviewed (by Droid or a human reviewer).
- No `any` types, no ESLint warnings, no dead code flagged by Knip.
- The Next.js dev server starts without errors (`pnpm dev`).

## Sub-pages

- [Development workflow](./development-workflow.md) — branching, commits, pre-commit hooks, and the PR review cycle.
- [Testing](./testing.md) — Vitest setup, existing test coverage, and how to run tests.
- [Debugging](./debugging.md) — common issues with Supabase, RLS, and the dev server.
- [Patterns and conventions](./patterns-and-conventions.md) — TypeScript style, component organization, and query patterns.
- [Tooling](./tooling.md) — ESLint, Prettier, Husky, Knip, jscpd, and Vitest configuration.
