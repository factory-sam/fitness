# Development workflow

## Branching

All work branches from `main`. There are no long-lived feature branches or release branches. The repository uses a single-branch trunk-based model.

```bash
git checkout main
git pull origin main
git checkout -b your-branch-name
```

## Making changes

The codebase is a Next.js 16 App Router project at `app/` with source files under `src/`. Key locations:

- `src/app/(app)/` — authenticated route pages and API routes.
- `src/app/(auth)/` — login and signup pages.
- `src/components/` — React components grouped by domain.
- `src/lib/queries.ts` — all Supabase database queries.
- `src/utils/supabase/` — Supabase client helpers (server, client, middleware).

See [Patterns and conventions](./patterns-and-conventions.md) for style rules and [Tooling](./tooling.md) for linter and formatter configuration.

## Pre-commit hooks

Husky and lint-staged run automatically on every commit:

- **Prettier** formats all staged files.
- **ESLint** checks all staged `.ts` and `.tsx` files.

If either tool reports errors, the commit is blocked. Fix the issues and try again.

## Committing

Write concise commit messages that describe what changed and why. The existing commit history uses imperative mood (e.g., "Add manual time entry for timer-based exercises").

## Pushing and PR review

Push your branch and open a pull request against `main`. The `droid-review.yml` GitHub Actions workflow triggers Factory Droid to perform an automated code review on the PR. Address any findings before merging.

## Running locally

```bash
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:3000`. You need a `.env.local` file with Supabase credentials — see [Configuration](../reference/configuration.md).
