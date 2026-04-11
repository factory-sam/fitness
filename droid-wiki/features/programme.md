# Programme

> Active contributors: Sam

## Purpose

The programme page (`/programme`) displays the current training programme structure — a 12-week upper/lower 4-day split called "RECOMP I". It is a Server Component that fetches programme days and their exercises directly from Supabase, then renders block progression and collapsible day cards.

## Key source files

| File | Role |
|---|---|
| `app/src/app/(app)/programme/page.tsx` | Page — Server Component, fetches days + exercises from Supabase |
| `app/src/components/programme/programme-day-card.tsx` | Collapsible day card with warmup/working exercise table |

## How it works

### Data fetching

Unlike most pages that use `lib/queries.ts`, the programme page creates a Supabase client directly and runs two queries:

1. `supabase.from("programme_days").select("*").order("day_number")` — fetches all programme days.
2. For each day: `supabase.from("programme_exercises").select("*").eq("day_id", day.id).order("exercise_order")` — fetches exercises grouped by day.

The exercises are stored in a `Record<number, Exercise[]>` keyed by day ID.

### Block progression display

Four blocks are hard-coded in the page and rendered as an inline row of equally-sized cells:

| Block | Weeks | Phase |
|---|---|---|
| Block 1 | 1–4 | Volume |
| Block 2 | 5–8 | Intensity |
| Block 3 | 9–11 | Strength |
| Block 4 | 12 | Deload |

The active block gets a gold border and gold-muted background. Upcoming blocks have a subtle border. Block status is currently hard-coded as `"active"` for Block 1.

### Collapsible day cards

Each programme day is rendered by `ProgrammeDayCard`. The card header shows:
- Day number (gold-dim text)
- Day name and focus description
- Working exercise count
- Expand/collapse chevron (▶ rotates 90° when open)

The first card (`defaultOpen={true}`) is expanded by default; the rest are collapsed.

### Exercise table

When expanded, the card renders a `data-table` with columns: superset group, exercise name, sets × reps, RPE, and rest time.

**Warmup vs working separation**: Exercises are split by `is_warmup`. If warmups exist, they appear first under a "Warm-Up" section header at 50% opacity. Working sets appear under a "Working Sets" header (only shown when warmups are also present).

**Superset grouping**: Exercises with a `superset_group` value (e.g. "A1", "A2") display a gold badge in the first column. This visually links exercises that should be performed back-to-back.

RPE and rest columns show `"--"` for warmups and when values are null.

## Cross-references

- The [Workout logger](./workout-logger.md) fetches the same programme data via `GET /api/programme` to pre-load exercises for logging.
- The [Exercise library](./exercises.md) uses `programme_exercises` to determine which exercises are in the active programme.
- The [Dashboard](./dashboard.md) uses `getProgrammeDays()` to suggest the next workout day.
