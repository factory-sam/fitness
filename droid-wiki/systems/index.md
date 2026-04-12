# Systems

Vitruvian is built on three internal systems that handle security, data access, and visual presentation.

## [Authentication](./auth.md)

Supabase Auth with email/password login. Middleware intercepts every request and redirects unauthenticated users to `/login`. Row Level Security (RLS) policies enforce data isolation at the database level using `auth.uid()`.

## [Data layer](./data-layer.md)

A centralized query layer in `lib/queries.ts` that wraps all Supabase calls. Server Components call queries directly; Client Components go through [API routes](../api/index.md) which also call the same query functions. Every query returns `data ?? []` — never assumes non-null.

## [Design system](./design-system.md)

Dark theme with gold accent, built on Tailwind CSS 4 with custom `@theme` tokens. Three-font system (serif headings, monospace data, sans body) with a Major Third type scale. Component patterns include cards, data tables, a terminal-style status bar, and gold-gradient heatmaps.
