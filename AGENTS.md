# VITRUVIAN — AGENTS.MD

## Project Overview

Vitruvian is a personal fitness tracker web app. Next.js 16 frontend backed by
Supabase (Postgres + Auth). Single-user for now, but the data model supports
multi-tenancy via RLS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, React 19) |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email/password) |
| Styling | Tailwind CSS 4 with custom `@theme` tokens |
| Charts | Recharts |
| Package Manager | pnpm |

---

## Architecture

### Route Groups
- `(app)/` — Authenticated routes. Wrapped in layout with sidebar nav + status bar.
- `(auth)/` — Login, signup, auth callback. No chrome — standalone pages.

### Data Flow
- **Server Components** call `lib/queries.ts` which uses the Supabase server client.
- **Client Components** (workout logger, supplements) call API routes under `(app)/api/`.
- **API routes** also use `lib/queries.ts`.
- All queries go through the Supabase client which respects RLS policies.

### Auth
- Middleware (`src/middleware.ts`) intercepts all requests.
- Unauthenticated users → redirect to `/login`.
- Supabase `auth.uid()` drives RLS. `BEFORE INSERT` triggers auto-set `user_id`.
- No service role key in the app — everything uses the publishable key.

---

## Design System

### Color Tokens (defined in `globals.css` @theme)
- `bg` / `bg-card` / `bg-elevated` / `bg-input` — surface hierarchy
- `gold` / `gold-dim` / `gold-bright` / `gold-muted` — accent, reserved for interactive + primary goal
- `text` / `text-secondary` / `text-muted` — text hierarchy
- `success` / `warning` / `error` / `info` — semantic states

### Typography
Major third scale (1.25 ratio), 7 levels: display, heading, subheading, body,
secondary, caption, micro. Utility classes: `.type-display` through `.type-micro`.

- Serif (Playfair Display) → headings
- Mono (JetBrains Mono) → data, labels, nav
- Sans (Inter) → body text

### Component Patterns
- `.card` — base surface (no hover effect by default)
- `.card-interactive` — adds hover border transition
- `.data-table` — Tufte-inspired monospace table
- `.status-bar` — fixed bottom terminal-style bar
- `.tui-border` / `.tui-border-gold` — box-drawing aesthetic borders

---

## Conventions

### Code Style
- TypeScript strict mode
- Prefer server components; use `"use client"` only when needed
- No `any` types — use `Record<string, unknown>` for dynamic shapes
- Supabase queries return `data ?? []` — never assume non-null

### File Organization
- Components grouped by domain: `dashboard/`, `workout/`, `body/`, `supplements/`, `programme/`
- Shared UI in `components/ui/`
- All Supabase queries in `lib/queries.ts` — pages and API routes import from there
- Supabase client helpers in `utils/supabase/` (server, client, middleware)

### Database
- All tables have `user_id UUID` with FK to `auth.users`
- RLS enabled on every table — policy: `auth.uid() = user_id`
- `BEFORE INSERT` triggers auto-populate `user_id`
- Booleans are Postgres `BOOLEAN`, not integers
- Dates are Postgres `DATE`, not text
- Schema changes via Supabase migrations (MCP or dashboard)

### Git
- No secrets, credentials, or personal data in the repo
- `.env.local` gitignored — contains Supabase URL + publishable key
- Screenshots and temp files gitignored (`*.png`, `.playwright-mcp/`)
