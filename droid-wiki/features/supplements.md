# Supplements

> Active contributors: Sam

## Purpose

The supplements page (`/supplements`) tracks daily supplement intake, visualises compliance over time, and manages the active supplement stack. It is a Client Component that fetches all data via API routes and uses optimistic updates for toggle interactions.

## Key source files

| File | Role |
|---|---|
| `app/src/app/(app)/supplements/page.tsx` | Page — Client Component, manages state + API calls |
| `app/src/components/supplements/today-stack.tsx` | Today's supplements grouped by time of day |
| `app/src/components/supplements/compliance-chart.tsx` | Streak counters, weekly bar chart, 12-week heatmap |
| `app/src/components/supplements/manage-stack.tsx` | Collapsible CRUD panel for supplement management |
| `app/src/app/(app)/api/supplements/route.ts` | GET (active or all) / POST (add) supplements |
| `app/src/app/(app)/api/supplements/[id]/route.ts` | PATCH — update a supplement (name, dosage, pause) |
| `app/src/app/(app)/api/supplements/log/route.ts` | GET (day log) / POST (log taken/untaken) |
| `app/src/app/(app)/api/supplements/stats/route.ts` | GET — streaks + compliance data for last N days |

## How it works

### Data loading

On mount, the page fires four parallel fetches:

1. `GET /api/supplements` — active supplements (for today's stack)
2. `GET /api/supplements?all=true` — all supplements including paused (for manage panel)
3. `GET /api/supplements/log?date={today}` — today's log entries
4. `GET /api/supplements/stats?days=90` — streak and compliance data

All four run via `Promise.all`. A global `fetchAll()` function re-fetches everything after any mutation.

### Section 1 — Today's stack

`TodayStack` groups supplements by `time_of_day` in a fixed order: Morning → Post-Workout → Evening → Anytime. Each group is separated by a labeled divider.

Each supplement is a full-width toggle button. Clicking toggles the taken state:
- **Taken**: green check, green border, strikethrough name
- **Not taken**: neutral border, plain name

A progress bar at the top shows `taken/total` with a percentage.

### Optimistic toggle with rollback

When toggling a supplement:
1. The supplement ID is added to `togglingIds` (prevents double-taps).
2. `todayLog` state is updated immediately (optimistic).
3. A POST to `/api/supplements/log` is sent with `supplement_id`, `date`, `taken` (0/1), and `time_taken`.
4. On success: `fetchAll()` refreshes everything.
5. On failure: `todayLog` is rolled back to the previous state.

### Section 2 — Streaks & compliance

`ComplianceChart` has three visualisations:

**Streak counters**: Grid of cards showing each supplement's current streak (consecutive days taken) and longest streak. Uses `font-mono text-lg text-success` for the streak number.

**Weekly compliance bar chart**: 7-column bar chart for the current week (Mon–Sun). Bar height is proportional to the compliance ratio (0–1). Future days render as dashed-border empty cells. Color intensity scales: gold (100%) → gold-dim (≥50%) → gold-muted (>0%).

**12-week adherence heatmap**: A grid of 3×3px squares arranged in week columns × day rows. Color maps compliance to a 5-step gold gradient from `#1a1508` (0%) to `var(--color-gold)` (100%). A legend bar is rendered below. This mirrors GitHub's contribution graph pattern.

### Section 3 — Manage stack

`ManageStack` is a collapsible panel (click header to expand). When expanded:

- Lists all supplements (including paused, shown at 50% opacity) with name, dosage, time of day, and frequency.
- Each item has **EDIT** and **PAUSE/RESUME** buttons.
- **EDIT** opens an inline form pre-filled with the supplement data. The form has fields for name, amount, units (dropdown: g/mg/mcg/ml/oz/IU/caps/tabs/scoops), time of day, frequency (daily/workout-days/as-needed), and notes.
- **Add Supplement** button opens the same form in create mode.
- Add sends `POST /api/supplements`. Edit sends `PATCH /api/supplements/{id}`. Pause/resume sends `PATCH` with `{ active: 0 }` or `{ active: 1 }`.

## Cross-references

- The [Dashboard](./dashboard.md) today card shows the count of untaken supplements and links here.
- The [Workout logger](./workout-logger.md) supplement reminder bar reads the same log data and provides quick-take buttons.
