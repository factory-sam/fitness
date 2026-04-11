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

// --- Supplements ---

export function getActiveSupplements() {
  const db = getDb();
  return db
    .prepare("SELECT * FROM supplements WHERE active = 1 ORDER BY time_of_day, name")
    .all();
}

export function getAllSupplements() {
  const db = getDb();
  return db
    .prepare("SELECT * FROM supplements ORDER BY active DESC, time_of_day, name")
    .all();
}

export function createSupplement(data: {
  name: string;
  dosage?: string;
  time_of_day?: string;
  frequency?: string;
  notes?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO supplements (name, dosage, time_of_day, frequency, notes) VALUES (?, ?, ?, ?, ?)"
  );
  return stmt.run(
    data.name,
    data.dosage ?? null,
    data.time_of_day ?? "any",
    data.frequency ?? "daily",
    data.notes ?? null
  );
}

export function updateSupplement(
  id: number,
  data: {
    name?: string;
    dosage?: string;
    time_of_day?: string;
    frequency?: string;
    active?: number;
    notes?: string;
  }
) {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  return db
    .prepare(`UPDATE supplements SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
}

export function logSupplementIntake(data: {
  supplement_id: number;
  date: string;
  taken?: number;
  time_taken?: string;
  notes?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO supplement_log (supplement_id, date, taken, time_taken, notes)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(supplement_id, date) DO UPDATE SET
       taken = excluded.taken,
       time_taken = excluded.time_taken,
       notes = excluded.notes`
  );
  return stmt.run(
    data.supplement_id,
    data.date,
    data.taken ?? 1,
    data.time_taken ?? null,
    data.notes ?? null
  );
}

export function getSupplementLogForDate(date: string) {
  const db = getDb();
  return db
    .prepare(
      `SELECT sl.*, s.name, s.dosage, s.time_of_day, s.frequency
       FROM supplement_log sl
       JOIN supplements s ON sl.supplement_id = s.id
       WHERE sl.date = ?`
    )
    .all(date);
}

export function getSupplementLogRange(startDate: string, endDate: string) {
  const db = getDb();
  return db
    .prepare(
      `SELECT sl.*, s.name, s.dosage, s.time_of_day
       FROM supplement_log sl
       JOIN supplements s ON sl.supplement_id = s.id
       WHERE sl.date BETWEEN ? AND ?
       ORDER BY sl.date DESC`
    )
    .all(startDate, endDate);
}

export function getSupplementStreaks() {
  const db = getDb();
  const supplements = db
    .prepare("SELECT * FROM supplements WHERE active = 1")
    .all() as { id: number; name: string }[];

  const today = new Date().toISOString().split("T")[0];
  const streaks: { id: number; name: string; streak: number; longest: number }[] = [];

  for (const supp of supplements) {
    const logs = db
      .prepare(
        "SELECT date FROM supplement_log WHERE supplement_id = ? AND taken = 1 ORDER BY date DESC"
      )
      .all(supp.id) as { date: string }[];

    let streak = 0;
    let checkDate = new Date(today);

    for (const log of logs) {
      const logDate = log.date;
      const expected = checkDate.toISOString().split("T")[0];
      if (logDate === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak
    let longest = 0;
    let currentRun = 0;
    const allLogs = db
      .prepare(
        "SELECT date FROM supplement_log WHERE supplement_id = ? AND taken = 1 ORDER BY date"
      )
      .all(supp.id) as { date: string }[];

    for (let i = 0; i < allLogs.length; i++) {
      if (i === 0) {
        currentRun = 1;
      } else {
        const prev = new Date(allLogs[i - 1].date);
        const curr = new Date(allLogs[i].date);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        currentRun = diff === 1 ? currentRun + 1 : 1;
      }
      longest = Math.max(longest, currentRun);
    }

    streaks.push({ id: supp.id, name: supp.name, streak, longest });
  }

  return streaks;
}

export function getSupplementComplianceStats(days = 30) {
  const db = getDb();
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const activeSupps = db
    .prepare("SELECT COUNT(*) as count FROM supplements WHERE active = 1")
    .get() as { count: number };

  const dailyCompliance = db
    .prepare(
      `SELECT date, COUNT(*) as taken_count
       FROM supplement_log
       WHERE taken = 1 AND date BETWEEN ? AND ?
       GROUP BY date
       ORDER BY date`
    )
    .all(startDate, endDate) as { date: string; taken_count: number }[];

  return {
    totalActive: activeSupps.count,
    dailyCompliance: dailyCompliance.map((d) => ({
      ...d,
      compliance: activeSupps.count > 0 ? d.taken_count / activeSupps.count : 0,
    })),
  };
}

export function getUntakenSupplementsToday() {
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];
  return db
    .prepare(
      `SELECT s.* FROM supplements s
       WHERE s.active = 1
       AND s.id NOT IN (
         SELECT supplement_id FROM supplement_log WHERE date = ? AND taken = 1
       )
       ORDER BY s.time_of_day, s.name`
    )
    .all(today);
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
