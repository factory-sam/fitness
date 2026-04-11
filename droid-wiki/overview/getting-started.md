# Getting started

## Prerequisites

- Node.js 18+
- pnpm
- A Supabase project with the schema migrations applied

## Setup

```bash
cd app
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`. You will be redirected to `/login` on first visit.

## Available commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest test suite |
| `pnpm knip` | Detect unused exports and dependencies |
| `pnpm run detect:duplicates` | Find copy-pasted code with jscpd |
| `pnpm format` | Format code with Prettier |
