# Data models

All data lives in Supabase Postgres. Every table has a `user_id UUID` column with a foreign key to `auth.users`. Row Level Security (RLS) is enabled on every table with the policy `auth.uid() = user_id`. `BEFORE INSERT` triggers auto-populate `user_id` so client code never needs to set it manually.

## Tables

### `sessions`

Workout sessions. Each session contains one or more sets.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | Primary key |
| `date` | `DATE` | Workout date |
| `name` | `TEXT` | Session name/label |
| `programme` | `TEXT` | Programme name |
| `block` | `TEXT` | Training block |
| `week` | `INTEGER` | Week number within block |
| `notes` | `TEXT` | Free-form notes |
| `user_id` | `UUID` | FK to `auth.users` |

### `sets`

Individual exercise sets within a session.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | Primary key |
| `session_id` | `UUID` | FK to `sessions.id` |
| `exercise` | `TEXT` | Exercise name |
| `set_number` | `INTEGER` | Order within the exercise |
| `reps` | `INTEGER` | Repetitions completed |
| `weight` | `NUMERIC` | Weight used |
| `weight_unit` | `TEXT` | `lbs` or `kg` |
| `rpe` | `NUMERIC` | Rate of perceived exertion (1–10) |
| `duration_sec` | `INTEGER` | Duration for timed exercises (e.g., dead hang) |
| `is_calibration` | `BOOLEAN` | Whether this set is a calibration/test set |
| `notes` | `TEXT` | Set-specific notes |

### `body_comp`

Body composition measurements over time.

| Column | Type | Notes |
|---|---|---|
| `date` | `DATE` | Measurement date |
| `weight_lbs` | `NUMERIC` | Body weight in pounds |
| `body_fat_pct` | `NUMERIC` | Body fat percentage |
| `lean_mass_lbs` | `NUMERIC` | Lean body mass in pounds |
| `vo2_max` | `NUMERIC` | VO2 max estimate |
| `user_id` | `UUID` | FK to `auth.users` |

### `measurements`

Tape measurements for body circumferences.

| Column | Type | Notes |
|---|---|---|
| `date` | `DATE` | Measurement date |
| `shoulders` | `NUMERIC` | Shoulder circumference |
| `chest` | `NUMERIC` | Chest circumference |
| `waist` | `NUMERIC` | Waist circumference |
| `hips` | `NUMERIC` | Hip circumference |
| `upper_arm_r` | `NUMERIC` | Right upper arm |
| `upper_arm_l` | `NUMERIC` | Left upper arm |
| `thigh_r` | `NUMERIC` | Right thigh |
| `thigh_l` | `NUMERIC` | Left thigh |
| `user_id` | `UUID` | FK to `auth.users` |

### `working_weights`

Current working weight for each exercise. The query layer deduplicates by exercise, returning only the most recent entry.

| Column | Type | Notes |
|---|---|---|
| `exercise` | `TEXT` | Exercise name |
| `weight` | `NUMERIC` | Current working weight |
| `weight_unit` | `TEXT` | `lbs` or `kg` |
| `date_set` | `DATE` | When this weight was set |
| `user_id` | `UUID` | FK to `auth.users` |

### `programme_days`

Days within the training programme.

| Column | Type | Notes |
|---|---|---|
| `day_number` | `INTEGER` | Day order (1, 2, 3…) |
| `day_name` | `TEXT` | Display name (e.g., "Upper A") |
| `focus` | `TEXT` | Training focus (e.g., "Push", "Pull") |
| `user_id` | `UUID` | FK to `auth.users` |

### `programme_exercises`

Exercises assigned to each programme day.

| Column | Type | Notes |
|---|---|---|
| `day_id` | `UUID` | FK to `programme_days.id` |
| `exercise_order` | `INTEGER` | Display order within the day |
| `exercise` | `TEXT` | Exercise name |
| `sets` | `INTEGER` | Prescribed number of sets |
| `reps` | `TEXT` | Prescribed reps (can be a range like "8-12") |
| `target_rpe` | `NUMERIC` | Target RPE |
| `rest_seconds` | `INTEGER` | Rest period between sets |
| `is_warmup` | `BOOLEAN` | Whether this is a warmup exercise |
| `superset_group` | `TEXT` | Groups exercises into supersets |
| `user_id` | `UUID` | FK to `auth.users` |

### `supplements`

Supplement definitions with dosage and schedule.

| Column | Type | Notes |
|---|---|---|
| `name` | `TEXT` | Supplement name |
| `amount` | `NUMERIC` | Dosage amount |
| `units` | `TEXT` | Dosage units (e.g., "mg", "g") |
| `time_of_day` | `TEXT` | When to take (e.g., "morning", "evening") |
| `frequency` | `TEXT` | How often (e.g., "daily") |
| `active` | `BOOLEAN` | Whether currently taking this supplement |
| `user_id` | `UUID` | FK to `auth.users` |

### `supplement_log`

Daily tracking of whether each supplement was taken.

| Column | Type | Notes |
|---|---|---|
| `supplement_id` | `UUID` | FK to `supplements.id` |
| `date` | `DATE` | Log date |
| `taken` | `BOOLEAN` | Whether the supplement was taken |
| `time_taken` | `TIMESTAMPTZ` | When it was taken |
| `user_id` | `UUID` | FK to `auth.users` |

## Relationships

- `sets.session_id` → `sessions.id` (many sets per session)
- `programme_exercises.day_id` → `programme_days.id` (many exercises per day)
- `supplement_log.supplement_id` → `supplements.id` (many log entries per supplement)

## RLS pattern

Every table follows the same RLS pattern:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own data"
  ON table_name FOR ALL
  USING (auth.uid() = user_id);
```

`BEFORE INSERT` triggers on each table set `user_id = auth.uid()` automatically, so insert operations never need to include `user_id` in the payload.
