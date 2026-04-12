# Features

> Active contributors: Sam

Vitruvian has six user-facing pages, accessible via the sidebar navigation. Each page corresponds to a route group under `app/src/app/(app)/`.

| Feature | Route | Description |
|---|---|---|
| [Dashboard](./dashboard.md) | `/` | At-a-glance view of progress, streaks, body metrics, and recent activity |
| [Workout logger](./workout-logger.md) | `/workout` | Three-phase session logger with programme pre-loading, rest timer, and stopwatch |
| [Body tracking](./body-tracking.md) | `/body` | Body composition stats and Vitruvian Man measurement overlay |
| [Supplements](./supplements.md) | `/supplements` | Daily supplement tracking, compliance heatmap, and stack management |
| [Programme](./programme.md) | `/programme` | 4-day upper/lower split viewer with block periodisation |
| [Exercise library](./exercises.md) | `/exercises` | Searchable exercise list with logged history and max weights |

## Architecture notes

- **Server Components** (Dashboard, Body, Programme, Exercises) fetch data at request time via `lib/queries.ts`, which wraps Supabase calls.
- **Client Components** (Workout logger, Supplements) use `fetch()` against API routes under `(app)/api/` for reads and mutations.
- All pages are wrapped in the `(app)` layout, which provides the sidebar nav and status bar.
- Every Supabase query respects RLS — `auth.uid() = user_id` on all tables.
