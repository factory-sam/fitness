import { ExerciseList } from "../../../components/exercises/exercise-list";
import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get all unique exercises that have been logged
  const { data: loggedRaw } = await supabase
    .from("sets")
    .select("exercise, weight, sessions!inner(date)")
    .order("exercise");

  // Aggregate in JS
  const exerciseMap = new Map<string, { exercise: string; count: number; max_weight: number | null; last_date: string }>();
  for (const row of loggedRaw ?? []) {
    const session = row.sessions as unknown as { date: string };
    const existing = exerciseMap.get(row.exercise);
    if (!existing) {
      exerciseMap.set(row.exercise, {
        exercise: row.exercise,
        count: 1,
        max_weight: row.weight,
        last_date: session.date,
      });
    } else {
      existing.count++;
      if (row.weight != null && (existing.max_weight == null || row.weight > existing.max_weight)) {
        existing.max_weight = row.weight;
      }
      if (session.date > existing.last_date) {
        existing.last_date = session.date;
      }
    }
  }
  const loggedExercises = Array.from(exerciseMap.values());

  // Get all programme exercises as the full library
  const { data: progExercises } = await supabase
    .from("programme_exercises")
    .select("exercise")
    .eq("is_warmup", false)
    .order("exercise");

  const programmeExercises = [...new Set((progExercises ?? []).map((r) => r.exercise))];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="type-heading text-text">Exercise Library</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          All exercises in your programme with logged history
        </p>
      </header>

      <ExerciseList
        programmeExercises={programmeExercises}
        loggedExercises={loggedExercises}
      />
    </div>
  );
}
