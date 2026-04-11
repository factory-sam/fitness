# Dependencies

Package manager: **pnpm**. All versions below are from `package.json`.

## Runtime dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | `16.2.3` | React framework (App Router, Server Components) |
| `react` | `19.2.4` | UI library |
| `react-dom` | `19.2.4` | React DOM renderer |
| `@supabase/ssr` | `^0.10.2` | Supabase server-side rendering helpers (cookie handling, middleware) |
| `@supabase/supabase-js` | `^2.103.0` | Supabase JavaScript client (database, auth, realtime) |
| `recharts` | `^3.8.1` | Charting library for dashboard visualizations |

## Development dependencies

| Package | Version | Purpose |
|---|---|---|
| `typescript` | `^5` | TypeScript compiler |
| `eslint` | `^9` | Linter — see [Tooling](../how-to-contribute/tooling.md) |
| `eslint-config-next` | `16.2.3` | Next.js ESLint preset (core-web-vitals + typescript rules) |
| `tailwindcss` | `^4` | Utility-first CSS framework |
| `@tailwindcss/postcss` | `^4` | PostCSS plugin for Tailwind CSS 4 |
| `prettier` | `^3.8.2` | Code formatter |
| `husky` | `^9.1.7` | Git hooks manager |
| `lint-staged` | `^16.4.0` | Run linters on staged files only |
| `vitest` | `^4.1.4` | Test runner — see [Testing](../how-to-contribute/testing.md) |
| `@vitejs/plugin-react` | `^6.0.1` | React support for Vitest (JSX transform) |
| `knip` | `^6.4.0` | Dead code and unused dependency detection |
| `jscpd` | `^4.0.9` | Copy-paste detection |

## Adding dependencies

```bash
pnpm add <package>           # runtime dependency
pnpm add -D <package>        # development dependency
```

Run `pnpm knip` after adding or removing packages to verify no unused dependencies remain.
