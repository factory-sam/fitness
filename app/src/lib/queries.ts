import { getDb } from "./db";

// --- Sessions ---

export function getRecentSessions(limit = 10) {
  const db = getDb();
  return db
    .prepare("SELECT * FROM sessions ORDER BY date DESC LIMIT ?")
    .all(limit);
}

export function getSession(id: number) {
  const db = getDb();
  const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
  const sets = db
    .prepare("SELECT * FROM sets WHERE session_id = ? ORDER BY set_number")
    .all(id);
  return { ...(session as Record<string, unknown>), sets };
}

export function createSession(data: {
  date: string;
  name: string;
  programme?: string;
  block?: string;
  week?: number;
  notes?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO sessions (date, name, programme, block, week, notes) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(
    data.date,
    data.name,
    data.programme ?? null,
    data.block ?? null,
    data.week ?? null,
    data.notes ?? null
  );
  return result.lastInsertRowid;
}

export function createSet(data: {
  session_id: number;
  exercise: string;
  set_number: number;
  reps?: number;
  weight?: number;
  weight_unit?: string;
  rpe?: number;
  duration_sec?: number;
  is_calibration?: number;
  notes?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO sets (session_id, exercise, set_number, reps, weight, weight_unit, rpe, duration_sec, is_calibration, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  return stmt.run(
    data.session_id,
    data.exercise,
    data.set_number,
    data.reps ?? null,
    data.weight ?? null,
    data.weight_unit ?? "lbs",
    data.rpe ?? null,
    data.duration_sec ?? null,
    data.is_calibration ?? 0,
    data.notes ?? null
  );
}

// --- Working Weights ---

export function getAllWorkingWeights() {
  const db = getDb();
  return db
    .prepare(
      `SELECT w.exercise, w.weight, w.weight_unit, w.date_set
       FROM working_weights w
       INNER JOIN (
         SELECT exercise, MAX(date_set) as max_date FROM working_weights GROUP BY exercise
       ) latest ON w.exercise = latest.exercise AND w.date_set = latest.max_date
       ORDER BY w.exercise`
    )
    .all();
}

export function getExerciseHistory(exercise: string, limit = 50) {
  const db = getDb();
  return db
    .prepare(
      `SELECT s.date, s.name as session_name, st.set_number, st.reps, st.weight, st.weight_unit, st.rpe, st.duration_sec, st.notes
       FROM sets st
       JOIN sessions s ON st.session_id = s.id
       WHERE st.exercise = ?
       ORDER BY s.date DESC, st.set_number
       LIMIT ?`
    )
    .all(exercise, limit);
}

export function getPersonalRecords() {
  const db = getDb();
  return db
    .prepare(
      `SELECT st.exercise, MAX(st.weight) as max_weight, st.weight_unit, s.date
       FROM sets st
       JOIN sessions s ON st.session_id = s.id
       WHERE st.weight IS NOT NULL
       GROUP BY st.exercise
       ORDER BY st.exercise`
    )
    .all();
}

// --- Body Comp ---

export function getBodyCompHistory() {
  const db = getDb();
  return db
    .prepare("SELECT * FROM body_comp ORDER BY date DESC")
    .all();
}

export function getLatestBodyComp() {
  const db = getDb();
  return db
    .prepare("SELECT * FROM body_comp ORDER BY date DESC LIMIT 1")
    .get();
}

export function createBodyComp(data: {
  date: string;
  weight_lbs?: number;
  body_fat_pct?: number;
  lean_mass_lbs?: number;
  vo2_max?: number;
  notes?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO body_comp (date, weight_lbs, body_fat_pct, lean_mass_lbs, vo2_max, notes) VALUES (?, ?, ?, ?, ?, ?)"
  );
  return stmt.run(
    data.date,
    data.weight_lbs ?? null,
    data.body_fat_pct ?? null,
    data.lean_mass_lbs ?? null,
    data.vo2_max ?? null,
    data.notes ?? null
  );
}

// --- Measurements ---

export function getMeasurements() {
  const db = getDb();
  return db
    .prepare("SELECT * FROM measurements ORDER BY date DESC")
    .all();
}

export function getLatestMeasurements() {
  const db = getDb();
  return db
    .prepare("SELECT * FROM measurements ORDER BY date DESC LIMIT 1")
    .get();
}

export function createMeasurement(data: {
  date: string;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  upper_arm_r?: number;
  upper_arm_l?: number;
  thigh_r?: number;
  thigh_l?: number;
  notes?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO measurements (date, shoulders, chest, waist, hips, upper_arm_r, upper_arm_l, thigh_r, thigh_l, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  return stmt.run(
    data.date,
    data.shoulders ?? null,
    data.chest ?? null,
    data.waist ?? null,
    data.hips ?? null,
    data.upper_arm_r ?? null,
    data.upper_arm_l ?? null,
    data.thigh_r ?? null,
    data.thigh_l ?? null,
    data.notes ?? null
  );
}

// --- Volume & Stats ---

export function getWeeklyVolume() {
  const db = getDb();
  return db
    .prepare(
      `SELECT s.date, st.exercise, COUNT(st.id) as total_sets, SUM(st.reps) as total_reps, SUM(st.reps * st.weight) as volume
       FROM sets st
       JOIN sessions s ON st.session_id = s.id
       WHERE st.weight IS NOT NULL
       GROUP BY s.date, st.exercise
       ORDER BY s.date DESC`
    )
    .all();
}

export function getSessionDates() {
  const db = getDb();
  return db
    .prepare("SELECT DISTINCT date FROM sessions ORDER BY date")
    .all();
}

export function getWorkoutStreak() {
  const dates = getSessionDates() as { date: string }[];
  if (dates.length === 0) return 0;
  let streak = 1;
  const today = new Date();
  const lastDate = new Date(dates[dates.length - 1].date);
  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays > 3) return 0;
  for (let i = dates.length - 1; i > 0; i--) {
    const curr = new Date(dates[i].date);
    const prev = new Date(dates[i - 1].date);
    const diff = Math.floor(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff <= 3) streak++;
    else break;
  }
  return streak;
}

// --- Programme ---

export function getProgrammeDays() {
  const db = getDb();
  try {
    return db
      .prepare("SELECT * FROM programme_days ORDER BY day_number")
      .all();
  } catch {
    return [];
  }
}

export function getProgrammeExercises(dayId: number) {
  const db = getDb();
  try {
    return db
      .prepare(
        "SELECT * FROM programme_exercises WHERE day_id = ? ORDER BY exercise_order"
      )
      .all(dayId);
  } catch {
    return [];
  }
}
