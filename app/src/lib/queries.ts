import { cookies } from "next/headers";
import { createClient } from "../utils/supabase/server";
import { getLocalDateString } from "./date";

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// --- Sessions ---

export async function getRecentSessions(limit = 10) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getSession(id: number) {
  const supabase = await getSupabase();
  const { data: session } = await supabase.from("sessions").select("*").eq("id", id).single();
  if (!session) return null;
  const { data: sets } = await supabase
    .from("sets")
    .select("*")
    .eq("session_id", id)
    .order("set_number");
  return { ...session, sets: sets ?? [] };
}

export async function createSession(data: {
  date: string;
  name: string;
  programme?: string;
  block?: string;
  week?: number;
  notes?: string;
}) {
  const supabase = await getSupabase();
  const { data: row, error } = await supabase
    .from("sessions")
    .insert({
      date: data.date,
      name: data.name,
      programme: data.programme ?? null,
      block: data.block ?? null,
      week: data.week ?? null,
      notes: data.notes ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return row!.id;
}

export async function createSet(data: {
  session_id: number;
  exercise: string;
  set_number: number;
  reps?: number;
  weight?: number;
  weight_unit?: string;
  rpe?: number;
  duration_sec?: number;
  is_calibration?: boolean;
  notes?: string;
}) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("sets").insert({
    session_id: data.session_id,
    exercise: data.exercise,
    set_number: data.set_number,
    reps: data.reps ?? null,
    weight: data.weight ?? null,
    weight_unit: data.weight_unit ?? "lbs",
    rpe: data.rpe ?? null,
    duration_sec: data.duration_sec ?? null,
    is_calibration: data.is_calibration ?? false,
    notes: data.notes ?? null,
  });
  if (error) throw error;
}

// --- Working Weights ---

export async function getAllWorkingWeights() {
  const supabase = await getSupabase();
  // Get the latest weight for each exercise
  const { data } = await supabase
    .from("working_weights")
    .select("exercise, weight, weight_unit, date_set")
    .order("date_set", { ascending: false });
  if (!data) return [];
  // Deduplicate: keep first (latest) per exercise
  const seen = new Set<string>();
  return data.filter((row) => {
    if (seen.has(row.exercise)) return false;
    seen.add(row.exercise);
    return true;
  });
}

export async function upsertWorkingWeight(data: {
  exercise: string;
  weight: number;
  weight_unit?: string;
  source?: string;
  notes?: string;
}) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("working_weights").insert({
    exercise: data.exercise,
    weight: data.weight,
    weight_unit: data.weight_unit ?? "lbs",
    date_set: getLocalDateString(),
    source: data.source ?? "ai_agent",
    notes: data.notes ?? null,
  });
  if (error) throw error;
}

export async function getExerciseHistory(exercise: string, limit = 50) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("sets")
    .select(
      "set_number, reps, weight, weight_unit, rpe, duration_sec, notes, sessions!inner(date, name)",
    )
    .eq("exercise", exercise)
    .order("id", { ascending: false })
    .limit(limit);
  // Flatten the join
  return (data ?? []).map((row) => {
    const session = row.sessions as unknown as { date: string; name: string };
    return {
      date: session.date,
      session_name: session.name,
      set_number: row.set_number,
      reps: row.reps,
      weight: row.weight,
      weight_unit: row.weight_unit,
      rpe: row.rpe,
      duration_sec: row.duration_sec,
      notes: row.notes,
    };
  });
}

export async function getPersonalRecords() {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("sets")
    .select("exercise, weight, weight_unit, sessions!inner(date)")
    .not("weight", "is", null)
    .order("weight", { ascending: false });
  if (!data) return [];
  // Group by exercise, keep max weight
  const prs = new Map<
    string,
    { exercise: string; max_weight: number; weight_unit: string; date: string }
  >();
  for (const row of data) {
    const session = row.sessions as unknown as { date: string };
    if (!prs.has(row.exercise) || row.weight! > prs.get(row.exercise)!.max_weight) {
      prs.set(row.exercise, {
        exercise: row.exercise,
        max_weight: row.weight!,
        weight_unit: row.weight_unit!,
        date: session.date,
      });
    }
  }
  return Array.from(prs.values()).sort((a, b) => a.exercise.localeCompare(b.exercise));
}

// --- Body Comp ---

export async function getBodyCompHistory() {
  const supabase = await getSupabase();
  const { data } = await supabase.from("body_comp").select("*").order("date", { ascending: false });
  return data ?? [];
}

export async function getLatestBodyComp() {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("body_comp")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function createBodyComp(data: {
  date: string;
  weight_lbs?: number;
  body_fat_pct?: number;
  lean_mass_lbs?: number;
  vo2_max?: number;
  notes?: string;
}) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("body_comp").insert({
    date: data.date,
    weight_lbs: data.weight_lbs ?? null,
    body_fat_pct: data.body_fat_pct ?? null,
    lean_mass_lbs: data.lean_mass_lbs ?? null,
    vo2_max: data.vo2_max ?? null,
    notes: data.notes ?? null,
  });
  if (error) throw error;
}

// --- Measurements ---

export async function getMeasurements() {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("measurements")
    .select("*")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getLatestMeasurements() {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("measurements")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function createMeasurement(data: {
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
  const supabase = await getSupabase();
  const { error } = await supabase.from("measurements").insert(data);
  if (error) throw error;
}

// --- Volume & Stats ---

export async function getSessionDates() {
  const supabase = await getSupabase();
  const { data } = await supabase.from("sessions").select("date").order("date");
  return data ?? [];
}

export async function getWorkoutStreak() {
  const dates = await getSessionDates();
  if (dates.length === 0) return 0;
  let streak = 1;
  const today = new Date();
  const lastDate = new Date(dates[dates.length - 1].date);
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 3) return 0;
  for (let i = dates.length - 1; i > 0; i--) {
    const curr = new Date(dates[i].date);
    const prev = new Date(dates[i - 1].date);
    const diff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 3) streak++;
    else break;
  }
  return streak;
}

// --- Supplements ---

export async function getActiveSupplements() {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("supplements")
    .select("*")
    .eq("active", true)
    .order("time_of_day")
    .order("name");
  return data ?? [];
}

export async function getAllSupplements() {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("supplements")
    .select("*")
    .order("active", { ascending: false })
    .order("time_of_day")
    .order("name");
  return data ?? [];
}

export async function createSupplement(data: {
  name: string;
  amount?: number;
  units?: string;
  time_of_day?: string;
  frequency?: string;
  notes?: string;
}) {
  const supabase = await getSupabase();
  const { data: row, error } = await supabase
    .from("supplements")
    .insert({
      name: data.name,
      amount: data.amount ?? null,
      units: data.units ?? null,
      time_of_day: data.time_of_day ?? "any",
      frequency: data.frequency ?? "daily",
      notes: data.notes ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return row!.id;
}

export async function updateSupplement(id: number, data: Record<string, unknown>) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("supplements").update(data).eq("id", id);
  if (error) throw error;
}

export async function logSupplementIntake(data: {
  supplement_id: number;
  date: string;
  taken?: boolean;
  time_taken?: string;
  notes?: string;
}) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("supplement_log").upsert(
    {
      supplement_id: data.supplement_id,
      date: data.date,
      taken: data.taken ?? true,
      time_taken: data.time_taken ?? null,
      notes: data.notes ?? null,
    },
    { onConflict: "supplement_id,date" },
  );
  if (error) throw error;
}

export async function getSupplementLogForDate(date: string) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("supplement_log")
    .select("*, supplements(name, amount, units, time_of_day, frequency)")
    .eq("date", date);
  return data ?? [];
}

export async function getSupplementLogRange(startDate: string, endDate: string) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("supplement_log")
    .select("*, supplements(name, amount, units, time_of_day)")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getSupplementStreaks() {
  const supabase = await getSupabase();
  const { data: supplements } = await supabase
    .from("supplements")
    .select("id, name")
    .eq("active", true);
  if (!supplements) return [];

  const today = getLocalDateString();
  const streaks: { id: number; name: string; streak: number; longest: number }[] = [];

  for (const supp of supplements) {
    const { data: logs } = await supabase
      .from("supplement_log")
      .select("date")
      .eq("supplement_id", supp.id)
      .eq("taken", true)
      .order("date", { ascending: false });

    let streak = 0;
    const checkDate = new Date(today + "T00:00:00");
    for (const log of logs ?? []) {
      const expected = getLocalDateString(checkDate);
      if (log.date === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const { data: allLogs } = await supabase
      .from("supplement_log")
      .select("date")
      .eq("supplement_id", supp.id)
      .eq("taken", true)
      .order("date");

    let longest = 0;
    let currentRun = 0;
    for (let i = 0; i < (allLogs ?? []).length; i++) {
      if (i === 0) {
        currentRun = 1;
      } else {
        const prev = new Date(allLogs![i - 1].date);
        const curr = new Date(allLogs![i].date);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        currentRun = diff === 1 ? currentRun + 1 : 1;
      }
      longest = Math.max(longest, currentRun);
    }

    streaks.push({ id: supp.id, name: supp.name, streak, longest });
  }

  return streaks;
}

export async function getSupplementComplianceStats(days = 30) {
  const supabase = await getSupabase();
  const endDate = getLocalDateString();
  const startDate = getLocalDateString(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

  const { data: activeSupps } = await supabase.from("supplements").select("id").eq("active", true);
  const totalActive = activeSupps?.length ?? 0;

  const { data: logs } = await supabase
    .from("supplement_log")
    .select("date")
    .eq("taken", true)
    .gte("date", startDate)
    .lte("date", endDate);

  // Group by date
  const countByDate = new Map<string, number>();
  for (const log of logs ?? []) {
    countByDate.set(log.date, (countByDate.get(log.date) ?? 0) + 1);
  }

  const dailyCompliance = Array.from(countByDate.entries())
    .map(([date, taken_count]) => ({
      date,
      taken_count,
      compliance: totalActive > 0 ? taken_count / totalActive : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { totalActive, dailyCompliance };
}

export async function getUntakenSupplementsToday() {
  const supabase = await getSupabase();
  const today = getLocalDateString();

  const { data: takenIds } = await supabase
    .from("supplement_log")
    .select("supplement_id")
    .eq("date", today)
    .eq("taken", true);

  const taken = new Set((takenIds ?? []).map((r) => r.supplement_id));

  const { data: active } = await supabase
    .from("supplements")
    .select("*")
    .eq("active", true)
    .order("time_of_day")
    .order("name");

  return (active ?? []).filter((s) => !taken.has(s.id));
}

// --- Agent Query Helpers ---

export async function getSessionsWithSets(days = 30) {
  const supabase = await getSupabase();
  const since = getLocalDateString(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, date, name, programme, block, week, notes")
    .gte("date", since)
    .order("date", { ascending: false });
  if (!sessions || sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);
  const { data: sets } = await supabase
    .from("sets")
    .select("session_id, exercise, set_number, reps, weight, weight_unit, rpe, duration_sec, notes")
    .in("session_id", sessionIds)
    .order("set_number");

  const setsBySession = new Map<number, typeof sets>();
  for (const set of sets ?? []) {
    const list = setsBySession.get(set.session_id) ?? [];
    list.push(set);
    setsBySession.set(set.session_id, list);
  }

  return sessions.map((s) => ({
    ...s,
    sets: setsBySession.get(s.id) ?? [],
  }));
}

export async function getBodyCompEntries(days = 90) {
  const supabase = await getSupabase();
  const since = getLocalDateString(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
  const { data } = await supabase
    .from("body_comp")
    .select("date, weight_lbs, body_fat_pct, lean_mass_lbs, vo2_max, notes")
    .gte("date", since)
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getProgrammeWithExercises() {
  const supabase = await getSupabase();
  const { data: days } = await supabase
    .from("programme_days")
    .select("id, programme, day_number, day_name, focus")
    .order("day_number");
  if (!days || days.length === 0) return [];

  const dayIds = days.map((d) => d.id);
  const { data: exercises } = await supabase
    .from("programme_exercises")
    .select(
      "day_id, exercise_order, exercise, sets, reps, target_rpe, rest_seconds, is_warmup, superset_group, notes",
    )
    .in("day_id", dayIds)
    .order("exercise_order");

  const exercisesByDay = new Map<number, typeof exercises>();
  for (const ex of exercises ?? []) {
    const list = exercisesByDay.get(ex.day_id) ?? [];
    list.push(ex);
    exercisesByDay.set(ex.day_id, list);
  }

  return days.map((d) => ({
    ...d,
    exercises: exercisesByDay.get(d.id) ?? [],
  }));
}

// --- Programme ---

export async function getProgrammeDays() {
  const supabase = await getSupabase();
  const { data } = await supabase.from("programme_days").select("*").order("day_number");
  return data ?? [];
}

export async function getProgrammeExercises(dayId: number) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("programme_exercises")
    .select("*")
    .eq("day_id", dayId)
    .order("exercise_order");
  return data ?? [];
}

// --- AI Sessions ---

export async function getAISessions(limit = 20) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("ai_sessions")
    .select("*")
    .order("last_active_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAISessionByDroidId(droidSessionId: string) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("ai_sessions")
    .select("*")
    .eq("droid_session_id", droidSessionId)
    .single();
  return data;
}

export async function createAISessionRecord(droidSessionId: string, title?: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("ai_sessions")
    .insert({
      droid_session_id: droidSessionId,
      title: title ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data!.id;
}

export async function updateAISessionTitle(id: number, title: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("ai_sessions").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function touchAISession(id: number) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("ai_sessions")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// --- AI Insights ---

export async function getCachedInsights() {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("ai_insights")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function cacheInsights(
  insights: { type: string; content: Record<string, unknown> }[],
  contextHash?: string,
) {
  const supabase = await getSupabase();
  const rows = insights.map((insight) => ({
    type: insight.type,
    content: insight.content,
    context_hash: contextHash ?? null,
  }));
  const { error } = await supabase.from("ai_insights").insert(rows);
  if (error) throw error;
}

export async function clearExpiredInsights() {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("ai_insights")
    .delete()
    .lt("expires_at", new Date().toISOString());
  if (error) throw error;
}

// --- Notification Preferences ---

export async function getNotificationPreferences() {
  const supabase = await getSupabase();
  const { data } = await supabase.from("notification_preferences").select("*").maybeSingle();
  return data;
}

export async function upsertNotificationPreferences(prefs: Record<string, unknown>) {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert({ user_id: user.id, ...prefs }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Notification Log ---

export async function getNotificationHistory(limit = 20, type?: string) {
  const supabase = await getSupabase();
  let query = supabase
    .from("notification_log")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(limit);
  if (type) query = query.eq("type", type);
  const { data } = await query;
  return data ?? [];
}

export async function markNotificationClicked(notificationId: number) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("notification_log")
    .update({ clicked: true })
    .eq("id", notificationId);
  if (error) throw error;
}

export async function getUnreadNotificationCount() {
  const supabase = await getSupabase();
  const { count } = await supabase
    .from("notification_log")
    .select("id", { count: "exact", head: true })
    .eq("clicked", false);
  return count ?? 0;
}
