# Configuration

## Environment variables

Stored in `.env.local` (gitignored). Both variables are required for the app to connect to Supabase.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (e.g., `https://your-project.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key for client-side access |

No service role key is used in the application. All database access goes through the publishable key and respects RLS policies. See [Data models](./data-models.md) for RLS details.

## Configuration files

### `next.config.ts`

Minimal configuration. Uses the default Next.js 16 settings with no custom webpack or experimental flags.

### `tsconfig.json`

- **Strict mode** enabled.
- **Module resolution**: `bundler`.
- **Path alias**: `@/*` maps to `./src/*`, so imports look like `import { getSessionSets } from "@/lib/queries"`.

### `eslint.config.mjs`

Flat config format with Next.js, TypeScript, naming-convention, complexity, max-lines, and no-warning-comments rules. See [Tooling](../how-to-contribute/tooling.md) for the full rule breakdown.

### `.prettierrc`

Prettier formatting configuration. Applied automatically via the pre-commit hook.

### `postcss.config.mjs`

Configures PostCSS with the `@tailwindcss/postcss` plugin for Tailwind CSS 4.

### `knip.config.ts`

Knip configuration for dead code detection. See [Tooling](../how-to-contribute/tooling.md).

### `.jscpd.json`

jscpd configuration for copy-paste detection. See [Tooling](../how-to-contribute/tooling.md).

### `vitest.config.ts`

Vitest test runner configuration with coverage thresholds at 50% statements. See [Testing](../how-to-contribute/testing.md).
