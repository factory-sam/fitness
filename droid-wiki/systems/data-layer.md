# Data layer

Active contributors: Sam

All database access goes through a centralized query layer in `lib/queries.ts`. This is the largest file in the codebase (~490 lines) and the only place Supabase queries are written. Pages, components, and API routes all import from here.

## Architecture

```
Server Components ──→ queries.ts ──→ Supabase (via server client)
                                         ↑
Client Components ──→ API routes ──→ queries.ts
```

- **Server Components** import query functions directly and call them during render.
- **Client Components** cannot call `queries.ts` directly (it uses `cookies()` from `next/headers`). Instead, they fetch from [API routes](../api/index.md) under `(app)/api/`, which call the same query functions.

### Server client creation

Every query starts by calling `getSupabase()`:

```ts
async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}
```

This creates a Supabase server client from the current request cookies. The client respects RLS — queries only return data belonging to the authenticated user.

### Null safety pattern

Every query that returns a list uses the same pattern:

```ts
const { data } = await supabase.from("table").select("*");
return data ?? [];
```

Never assume `data` is non-null. Single-record queries return `null` when not found.

## Query reference

### Sessions

| Function | Returns | Notes |
|---|---|---|
| `getRecentSessions(limit)` | Session[] | Ordered by date descending, default limit 10 |
| `getSession(id)` | Session with sets, or null | Joins sets ordered by `set_number` |
| `createSession(data)` | Session ID (number) | Accepts date, name, programme, block, week, notes |
| `createSet(data)` | void | Inserts a single set with exercise, reps, weight, RPE, duration, calibration flag |

### Working weights

| Function | Returns | Notes |
|---|---|---|
| `getAllWorkingWeights()` | WorkingWeight[] | Deduplicates by exercise — keeps the latest entry per exercise |

### Exercise history

| Function | Returns | Notes |
|---|---|---|
| `getExerciseHistory(exercise, limit)` | SetWithDate[] | Joins sets with sessions to get dates. Flattens the join result. Default limit 50 |
| `getPersonalRecords()` | PR[] | Groups all sets by exercise, keeps the max weight for each. Sorted alphabetically |

### Body composition

| Function | Returns | Notes |
|---|---|---|
| `getBodyCompHistory()` | BodyComp[] | All entries, newest first |
| `getLatestBodyComp()` | BodyComp or null | Single most recent entry |
| `createBodyComp(data)` | void | Accepts date, weight_lbs, body_fat_pct, lean_mass_lbs, vo2_max, notes |

### Measurements

| Function | Returns | Notes |
|---|---|---|
| `getMeasurements()` | Measurement[] | All entries, newest first |
| `getLatestMeasurements()` | Measurement or null | Single most recent entry |
| `createMeasurement(data)` | void | Accepts date + body site measurements (shoulders, chest, waist, hips, arms, thighs) |

### Stats

| Function | Returns | Notes |
|---|---|---|
| `getSessionDates()` | {date}[] | All session dates, ascending. Used by streak calculation |
| `getWorkoutStreak()` | number | Counts consecutive sessions within 3-day gaps. Returns 0 if last session was >3 days ago |

### Supplements

| Function | Returns | Notes |
|---|---|---|
| `getActiveSupplements()` | Supplement[] | Active only, ordered by time_of_day then name |
| `getAllSupplements()` | Supplement[] | Active first, then inactive. Same ordering |
| `createSupplement(data)` | Supplement ID | Defaults: time_of_day "any", frequency "daily" |
| `updateSupplement(id, data)` | void | Partial update via `Record<string, unknown>` |
| `logSupplementIntake(data)` | void | Upserts on (supplement_id, date) — idempotent |
| `getSupplementLogForDate(date)` | LogEntry[] | Joins with supplements table for name/amount |
| `getSupplementLogRange(start, end)` | LogEntry[] | Date range query, newest first |
| `getSupplementStreaks()` | StreakInfo[] | Per-supplement current streak + longest streak. Checks consecutive days from today |
| `getSupplementComplianceStats(days)` | ComplianceData | Daily compliance ratio over N days (default 30). Groups log entries by date |
| `getUntakenSupplementsToday()` | Supplement[] | Active supplements not yet logged as taken today |

### Programme

| Function | Returns | Notes |
|---|---|---|
| `getProgrammeDays()` | ProgrammeDay[] | Ordered by day_number |
| `getProgrammeExercises(dayId)` | ProgrammeExercise[] | Exercises for a specific day, ordered by exercise_order |

## Key source files

| File | Purpose |
|---|---|
| `src/lib/queries.ts` | All Supabase queries (~490 lines) |
| `src/utils/supabase/server.ts` | Server client factory — `createClient(cookieStore)` |
| `src/utils/supabase/client.ts` | Browser client factory — `createClient()` |
| `src/utils/supabase/middleware.ts` | Middleware client with cookie refresh |
