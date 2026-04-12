# Dashboard

> Active contributors: Sam

## Purpose

The dashboard is the app's landing page (`/`). It gives a single-screen overview of training progress, body composition, consistency, and personal records. It is a Server Component that calls 8+ queries from `lib/queries.ts` and passes the results to presentational child components.

## Key source files

| File | Role |
|---|---|
| `app/src/app/(app)/page.tsx` | Page — Server Component, fetches all data |
| `app/src/components/dashboard/hero-stats.tsx` | S/W ratio arc, today actions card, body metrics row |
| `app/src/components/dashboard/consistency-calendar.tsx` | 12-week GitHub-style activity heatmap |
| `app/src/components/dashboard/recent-sessions.tsx` | Last 5 workout sessions list |
| `app/src/components/dashboard/pr-board.tsx` | Personal records table (exercise, max weight) |
| `app/src/components/dashboard/pullup-timeline.tsx` | Pull-up progression milestone timeline |
| `app/src/components/dashboard/body-comp-chart.tsx` | Recharts line chart (weight + body fat over time) |

## How it works

### Data fetching

The page calls these queries in sequence (no `Promise.all` — sequential `await`):

1. `getLatestBodyComp()` — most recent weight, BF%, VO₂ max
2. `getLatestMeasurements()` — most recent shoulder, waist, chest, hip, arm measurements
3. `getRecentSessions(5)` — last 5 logged sessions
4. `getSessionDates()` — all session dates for the consistency calendar
5. `getWorkoutStreak()` — current consecutive-session streak count
6. `getPersonalRecords()` — max weight per exercise
7. `getUntakenSupplementsToday()` — supplements not yet taken today
8. `getProgrammeDays()` — programme day names for the "next workout" prompt

The S/W ratio is computed in the page: `shoulders / waist`, formatted to 3 decimal places.

### Hero section

`HeroStats` renders three areas:

- **S/W ratio arc** — an SVG half-circle `ProgressArc` showing progress toward the 1.57 target. The arc uses `strokeDasharray` / `strokeDashoffset` for animation.
- **Today actions card** — links to next workout day, untaken supplements count, and current session streak. Each item links to its respective page.
- **Body metrics row** — inline display of weight, body fat, VO₂ max, and total sessions separated by vertical dividers.

### Consistency calendar

`ConsistencyCalendar` is a client component that renders a 12-week × 7-day grid of 10×10px squares. Workout days are gold (`bg-gold`), today gets a gold border, all others are `bg-bg-elevated`. Layout mirrors GitHub's contribution graph — rows are days of week, columns are weeks.

### Recent sessions

`RecentSessions` lists up to 5 sessions with name, notes (truncated), and date. Shows an empty state with a prompt if no sessions exist.

### PR board

`PRBoard` shows each exercise's max weight and unit. Sorted by the order returned from `getPersonalRecords()`.

### Pull-up timeline

`PullUpTimeline` is a static milestone list with 4 hard-coded progression phases: dead hangs → band-assisted negatives → band-assisted pull-ups → unassisted pull-up. Each milestone has a status (`active`, `complete`, `upcoming`) that controls the dot color and connector line style.

### Body composition chart

`BodyCompChart` (client component using Recharts) plots weight on the left Y-axis and body fat % on the right Y-axis over time. Falls back to a static display when there is only one data point.

## Cross-references

- The today card links to the [Workout logger](./workout-logger.md) and [Supplements](./supplements.md) pages.
- Body metrics come from the same Supabase tables used by [Body tracking](./body-tracking.md).
- PR data is aggregated from sets logged via the [Workout logger](./workout-logger.md).
