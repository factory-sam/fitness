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

## Design

Dark theme with a classical/terminal hybrid aesthetic. Three-font system:

- **Playfair Display** (serif) — headings
- **JetBrains Mono** (mono) — data, labels, navigation
- **Inter** (sans) — body text

Gold (`#c9a84c`) accent reserved for interactive elements and the primary goal metric (S/W ratio). Green for completion states. All data values in warm white.

## Auth

Email/password authentication via Supabase Auth. All tables have `user_id` columns with RLS policies — users can only access their own data. A `BEFORE INSERT` trigger auto-sets `user_id` from `auth.uid()`.

## Database

10 tables: `sessions`, `sets`, `body_comp`, `measurements`, `working_weights`, `milestones`, `programme_days`, `programme_exercises`, `supplements`, `supplement_log`. Schema managed via Supabase migrations.
