# Vitruvian

Vitruvian is a personal fitness tracker web app built for a single user. It combines workout logging, body composition tracking, supplement compliance, and programme management into a dark-themed dashboard with a classical/terminal hybrid aesthetic.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, React 19) |
| Database | Supabase Postgres with Row-Level Security |
| Auth | Supabase Auth (email/password) |
| Styling | Tailwind CSS 4 with custom `@theme` tokens |
| Charts | Recharts |
| Package manager | pnpm |

## Key features

- **Workout logging** — Log sets with weight, reps, and RPE. Built-in rest timer with audio cue. Manual time entry for timer-based exercises (dead hangs, planks). Superset support.
- **Body composition tracking** — Record weight, body fat, and measurements. Interactive Vitruvian Man SVG for selecting measurement sites. Tracks shoulder-to-waist (S/W) ratio against the golden ratio target (1.618).
- **Supplement compliance** — Daily supplement checklist with compliance percentage tracking over time.
- **Programme viewer** — View training programme organised by day and block. Displays exercises with prescribed sets, reps, and rest periods.
- **Exercise library** — Browse all exercises with personal record (PR) history and working weight tracking.
- **Dashboard** — S/W ratio as the hero metric, recent workout summary, body composition trends via Recharts, and supplement compliance at a glance.

## Codebase

~4,400 lines of TypeScript across 49 source files. All source code lives under `app/src/`. Database schema is managed via Supabase migrations.
