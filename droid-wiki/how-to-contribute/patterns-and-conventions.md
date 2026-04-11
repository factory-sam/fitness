# Patterns and conventions

## TypeScript

- **Strict mode** is enabled in `tsconfig.json`.
- No `any` types. Use `Record<string, unknown>` when a dynamic shape is needed.
- Supabase queries always use the `data ?? []` pattern — never assume the response is non-null.

## Server Components vs. Client Components

Prefer Server Components by default. Add the `"use client"` directive only when the component needs browser APIs, event handlers, or React hooks like `useState` / `useEffect`.

- Server Components call query functions from `src/lib/queries.ts` directly.
- Client Components call API routes under `src/app/(app)/api/` which in turn use the same query functions.

## Component organization

Components are grouped by domain under `src/components/`:

| Directory | Purpose |
|---|---|
| `dashboard/` | Dashboard widgets and summary cards |
| `workout/` | Workout logging and session display |
| `body/` | Body composition and measurement tracking |
| `supplements/` | Supplement management and logging |
| `programme/` | Training programme display and editing |
| `ui/` | Shared UI primitives (buttons, inputs, cards) |

## Query centralization

All Supabase database queries live in `src/lib/queries.ts`. Pages and API routes import from this single module. This keeps data access logic in one place and makes it testable — the unit tests in `src/lib/__tests__/queries.test.ts` mock the Supabase client and test these functions directly.

## Naming conventions

ESLint enforces naming rules via `@typescript-eslint/naming-convention`:

- **Variables and functions** — `camelCase`.
- **Types and interfaces** — `PascalCase`.
- **Constants** — `camelCase` or `UPPER_CASE` are both acceptable.

## Formatting

Prettier runs on every commit via the pre-commit hook. The configuration lives in `.prettierrc`. See [Tooling](./tooling.md) for details on all linting and formatting tools.
