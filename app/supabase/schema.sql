-- Vitruvian database schema
-- All tables use RLS with auth.uid() = user_id policy.
-- BEFORE INSERT triggers auto-populate user_id from auth.uid().

-- Training sessions
CREATE TABLE IF NOT EXISTS sessions (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date      DATE        NOT NULL,
  name      TEXT        NOT NULL,
  programme TEXT,
  block     TEXT,
  week      INTEGER,
  notes     TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id   UUID REFERENCES auth.users(id)
);

-- Individual sets within a session
CREATE TABLE IF NOT EXISTS sets (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id     BIGINT  NOT NULL REFERENCES sessions(id),
  exercise       TEXT    NOT NULL,
  set_number     INTEGER NOT NULL,
  reps           INTEGER,
  weight         NUMERIC,
  weight_unit    TEXT    DEFAULT 'lbs',
  rpe            NUMERIC,
  duration_sec   INTEGER,
  is_calibration BOOLEAN DEFAULT false,
  notes          TEXT,
  user_id        UUID REFERENCES auth.users(id)
);

-- Body composition entries (weight, body fat, lean mass, VO2 max)
CREATE TABLE IF NOT EXISTS body_comp (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date         DATE    NOT NULL,
  weight_lbs   NUMERIC,
  body_fat_pct NUMERIC,
  lean_mass_lbs NUMERIC,
  vo2_max      NUMERIC,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  user_id      UUID REFERENCES auth.users(id)
);

-- Tape measurements
CREATE TABLE IF NOT EXISTS measurements (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date        DATE NOT NULL,
  shoulders   NUMERIC,
  chest       NUMERIC,
  waist       NUMERIC,
  hips        NUMERIC,
  upper_arm_r NUMERIC,
  upper_arm_l NUMERIC,
  thigh_r     NUMERIC,
  thigh_l     NUMERIC,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID REFERENCES auth.users(id)
);

-- Current working weights per exercise
CREATE TABLE IF NOT EXISTS working_weights (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exercise    TEXT    NOT NULL,
  weight      NUMERIC NOT NULL,
  weight_unit TEXT    DEFAULT 'lbs',
  date_set    DATE    NOT NULL,
  source      TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID REFERENCES auth.users(id)
);

-- Personal records and milestones
CREATE TABLE IF NOT EXISTS milestones (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date        DATE NOT NULL,
  type        TEXT NOT NULL,
  description TEXT NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID REFERENCES auth.users(id)
);

-- Programme template days
CREATE TABLE IF NOT EXISTS programme_days (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  programme  TEXT    NOT NULL,
  day_number INTEGER NOT NULL,
  day_name   TEXT    NOT NULL,
  focus      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id    UUID REFERENCES auth.users(id)
);

-- Exercises within a programme day
CREATE TABLE IF NOT EXISTS programme_exercises (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  day_id         BIGINT  NOT NULL REFERENCES programme_days(id),
  exercise_order INTEGER NOT NULL,
  exercise       TEXT    NOT NULL,
  sets           INTEGER,
  reps           TEXT,
  target_rpe     NUMERIC,
  rest_seconds   INTEGER,
  is_warmup      BOOLEAN DEFAULT false,
  superset_group TEXT,
  notes          TEXT,
  user_id        UUID REFERENCES auth.users(id)
);

-- Supplement definitions
CREATE TABLE IF NOT EXISTS supplements (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT    NOT NULL,
  amount      NUMERIC,
  units       TEXT,
  time_of_day TEXT    DEFAULT 'any',
  frequency   TEXT    DEFAULT 'daily',
  active      BOOLEAN DEFAULT true,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID REFERENCES auth.users(id)
);

-- Daily supplement intake log
CREATE TABLE IF NOT EXISTS supplement_log (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  supplement_id BIGINT NOT NULL REFERENCES supplements(id),
  date          DATE   NOT NULL,
  taken         BOOLEAN DEFAULT true,
  time_taken    TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  user_id       UUID REFERENCES auth.users(id)
);

-- AI chat session metadata
CREATE TABLE IF NOT EXISTS ai_sessions (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id),
  droid_session_id TEXT NOT NULL,
  title            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  last_active_at   TIMESTAMPTZ DEFAULT now()
);

-- Cached AI-generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id),
  type         TEXT  NOT NULL,
  content      JSONB NOT NULL,
  context_hash TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  expires_at   TIMESTAMPTZ DEFAULT (now() + INTERVAL '6 hours')
);

-- Notification delivery preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  supplements_enabled   BOOLEAN NOT NULL DEFAULT true,
  supplements_time      TIME    NOT NULL DEFAULT '08:00',
  workout_enabled       BOOLEAN NOT NULL DEFAULT true,
  workout_time          TIME    NOT NULL DEFAULT '10:00',
  body_comp_enabled     BOOLEAN NOT NULL DEFAULT true,
  body_comp_day         INTEGER NOT NULL DEFAULT 0,
  body_comp_time        TIME    NOT NULL DEFAULT '08:00',
  quiet_hours_start     TIME,
  quiet_hours_end       TIME,
  timezone              TEXT    NOT NULL DEFAULT 'America/New_York',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification delivery log
CREATE TABLE IF NOT EXISTS notification_log (
  id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type    TEXT NOT NULL CHECK (type IN ('supplement', 'workout', 'body_comp')),
  payload JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clicked BOOLEAN NOT NULL DEFAULT false
);
