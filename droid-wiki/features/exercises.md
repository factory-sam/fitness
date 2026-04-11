# Exercise library

> Active contributors: Sam

## Purpose

The exercise library (`/exercises`) provides a searchable list of all exercises with logged history and performance stats. It is a Server Component that aggregates data from the `sets` and `programme_exercises` tables, then passes it to a client-side list component.

## Key source files

| File | Role |
|---|---|
| `app/src/app/(app)/exercises/page.tsx` | Page — Server Component, aggregates exercise data |
| `app/src/components/exercises/exercise-list.tsx` | Client Component — searchable, filterable table |

## How it works

### Data fetching and aggregation

The page creates a Supabase client and runs two queries:

1. **Logged sets**: `supabase.from("sets").select("exercise, weight, sessions!inner(date)")` — fetches all logged sets with their session dates via a join.
2. **Programme exercises**: `supabase.from("programme_exercises").select("exercise").eq("is_warmup", false)` — fetches all non-warmup exercises from the active programme.

Logged sets are aggregated in JavaScript using a `Map<string, stats>`:
- `count` — total number of sets logged for the exercise
- `max_weight` — highest weight used (null if bodyweight-only)
- `last_date` — most recent session date where the exercise appeared

Programme exercises are deduplicated into a unique list of exercise names.

### Exercise list component

`ExerciseList` merges both sources into a single sorted list: `[...programmeExercises, ...loggedExercises]` deduplicated and alphabetised.

**Search**: A text input at the top filters exercises by case-insensitive substring match on the exercise name.

**Table columns**:

| Column | Source |
|---|---|
| Exercise | Exercise name |
| Sets Logged | Aggregated count from `sets` table |
| Best Weight | `max_weight` in lbs, displayed in gold |
| Last Used | Most recent session date |
| Status | Badge: ACTIVE (in programme, gold), LOGGED (has history, muted), or — |

An empty state message appears when the search yields no results.

## Cross-references

- Exercise names come from the same `programme_exercises` table displayed on the [Programme](./programme.md) page.
- Set data is logged through the [Workout logger](./workout-logger.md) and stored in the `sets` table.
- Max weights here match the personal records shown on the [Dashboard](./dashboard.md) PR board.
