# Vitruvian

Personal fitness tracker and workout logger. Built with Next.js 16, Supabase, and Tailwind CSS 4.

## Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** Supabase (Postgres + Auth + RLS)
- **Styling:** Tailwind CSS 4 with custom design tokens
- **Charts:** Recharts
- **Deployment:** Vercel (planned)

## Structure

```
fitness/
├── app/                    # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/      # Authenticated routes (dashboard, workout, etc.)
│   │   │   ├── (auth)/     # Login, signup, auth callback
│   │   │   ├── globals.css  # Design tokens + type scale
│   │   │   └── layout.tsx   # Root layout
│   │   ├── components/      # UI components by domain
│   │   ├── lib/queries.ts   # Supabase query layer
│   │   ├── utils/supabase/  # Supabase client helpers (server, client, middleware)
│   │   └── middleware.ts    # Auth guard
│   ├── package.json
│   └── .env.local           # Supabase credentials (not committed)
└── README.md
```

## Getting Started

```bash
cd app
cp .env.local.example .env.local  # Add your Supabase credentials
pnpm install
pnpm dev
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### Local Database (optional)

To run Postgres locally instead of using hosted Supabase:

```bash
docker compose up -d          # starts Postgres on port 54322 + Studio on 54323
```

The schema in `app/supabase/schema.sql` is automatically applied on first start.
Point your `.env.local` at `http://localhost:54321` when using local Supabase, or
connect directly to Postgres on port `54322` (user: `postgres`, password: `postgres`).

### Dev Container

Open this repo in VS Code or GitHub Codespaces to get a pre-configured environment
with Node.js 22, pnpm, gh CLI, and recommended extensions (ESLint, Prettier,
Tailwind CSS IntelliSense, Playwright, Vitest).

## Design

Dark theme with a classical/terminal hybrid aesthetic. Three-font system:

- **Playfair Display** (serif) — headings
- **JetBrains Mono** (mono) — data, labels, navigation
- **Inter** (sans) — body text

Gold (`#c9a84c`) accent reserved for interactive elements and the primary goal metric (S/W ratio). Green for completion states. All data values in warm white.

## Auth

Email/password authentication via Supabase Auth. All tables have `user_id` columns with RLS policies — users can only access their own data. A `BEFORE INSERT` trigger auto-sets `user_id` from `auth.uid()`.

## Database

14 tables covering training, body composition, supplements, AI chat, and notifications.
Full schema definition: [`app/supabase/schema.sql`](app/supabase/schema.sql).
All tables use RLS with `auth.uid() = user_id` policies and `BEFORE INSERT` triggers.
