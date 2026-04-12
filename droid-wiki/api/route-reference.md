# Route reference

Complete list of API routes in `src/app/(app)/api/`. All routes require [authentication](../systems/auth.md) (enforced by middleware). All data access goes through [queries.ts](../systems/data-layer.md) unless noted.

## Sessions

| Method | Path | Description |
|---|---|---|
| GET | `/api/sessions` | List recent sessions. Query param: `?limit=N` (default 10). |
| POST | `/api/sessions` | Create a session with optional inline sets. Body: `{ date, name, programme?, block?, week?, notes?, sets?[] }`. Returns `{ id }` with status 201. |
| GET | `/api/sessions/[id]` | Get a single session with all its sets. Returns 404 if not found. |

## Stats

| Method | Path | Description |
|---|---|---|
| GET | `/api/stats` | Dashboard aggregate. Returns `{ bodyComp, measurements, swRatio, streak, totalSessions, recentSessions }`. The `swRatio` is shoulder-to-waist ratio, computed inline. |

## Body composition

| Method | Path | Description |
|---|---|---|
| GET | `/api/body-comp` | Body comp history. Query param: `?latest=true` returns only the most recent entry. |
| POST | `/api/body-comp` | Create body comp entry. Body: `{ date, weight_lbs?, body_fat_pct?, lean_mass_lbs?, vo2_max?, notes? }`. |

## Measurements

| Method | Path | Description |
|---|---|---|
| GET | `/api/measurements` | Measurements history. Query param: `?latest=true` returns only the most recent entry. |
| POST | `/api/measurements` | Create measurement. Body: `{ date, shoulders?, chest?, waist?, hips?, upper_arm_r?, upper_arm_l?, thigh_r?, thigh_l?, notes? }`. |

## Working weights

| Method | Path | Description |
|---|---|---|
| GET | `/api/working-weights` | Latest working weight per exercise (deduplicated). No parameters. |

## Supplements

| Method | Path | Description |
|---|---|---|
| GET | `/api/supplements` | List supplements. Query param: `?all=true` includes inactive. Default returns active only. Maps boolean `active` to 0/1 for client compatibility. |
| POST | `/api/supplements` | Create supplement. Body: `{ name, amount?, units?, time_of_day?, frequency?, notes? }`. Returns `{ id }` with status 201. |
| PATCH | `/api/supplements/[id]` | Partial update of a supplement. Body: any subset of supplement fields. |
| GET | `/api/supplements/log` | Get supplement intake log. Query params: `?date=YYYY-MM-DD` for a single day, or `?start=...&end=...` for a range. Defaults to today. Maps boolean `taken` to 0/1. |
| POST | `/api/supplements/log` | Log supplement intake. Body: `{ supplement_id, date?, taken?, time_taken?, notes? }`. Upserts on (supplement_id, date). |
| GET | `/api/supplements/stats` | Supplement compliance stats. Query param: `?days=N` (default 30). Returns `{ streaks[], compliance }` with per-supplement streak data and daily compliance ratios. |

## Exercises

| Method | Path | Description |
|---|---|---|
| GET | `/api/exercises` | Exercise data. Query params: `?exercise=Name&limit=N` for history of one exercise, or `?prs=true` for all personal records. Returns 400 if neither param is provided. |

## Programme

| Method | Path | Description |
|---|---|---|
| GET | `/api/programme` | Programme structure. Query param: `?day=N` returns a specific day with its exercises. Without params, returns all programme days. Note: this route creates the Supabase client directly instead of using `queries.ts`. |

## Key source files

| File | Purpose |
|---|---|
| `src/app/(app)/api/sessions/route.ts` | Sessions list + create |
| `src/app/(app)/api/sessions/[id]/route.ts` | Single session detail |
| `src/app/(app)/api/stats/route.ts` | Dashboard stats aggregate |
| `src/app/(app)/api/body-comp/route.ts` | Body composition CRUD |
| `src/app/(app)/api/measurements/route.ts` | Measurements CRUD |
| `src/app/(app)/api/working-weights/route.ts` | Working weights read |
| `src/app/(app)/api/supplements/route.ts` | Supplements list + create |
| `src/app/(app)/api/supplements/[id]/route.ts` | Supplement update |
| `src/app/(app)/api/supplements/log/route.ts` | Supplement intake logging |
| `src/app/(app)/api/supplements/stats/route.ts` | Compliance stats |
| `src/app/(app)/api/exercises/route.ts` | Exercise history + PRs |
| `src/app/(app)/api/programme/route.ts` | Programme structure |
