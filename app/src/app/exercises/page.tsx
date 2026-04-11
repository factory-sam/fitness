import { getDb } from "../../lib/db";
import { ExerciseList } from "../../components/exercises/exercise-list";

export const dynamic = "force-dynamic";

export default function ExercisesPage() {
  const db = getDb();

  // Get all unique exercises that have been logged
  let loggedExercises: { exercise: string; count: number; max_weight: number | null; last_date: string }[] = [];
  try {
    loggedExercises = db
      .prepare(
        `SELECT st.exercise, COUNT(st.id) as count, MAX(st.weight) as max_weight, MAX(s.date) as last_date
         FROM sets st
         JOIN sessions s ON st.session_id = s.id
         GROUP BY st.exercise
         ORDER BY st.exercise`
      )
      .all() as typeof loggedExercises;
  } catch {
    // No data yet
  }

  // Get all programme exercises as the full library
  let programmeExercises: string[] = [];
  try {
    const rows = db
      .prepare(
        "SELECT DISTINCT exercise FROM programme_exercises WHERE is_warmup = 0 ORDER BY exercise"
      )
      .all() as { exercise: string }[];
    programmeExercises = rows.map((r) => r.exercise);
  } catch {
    // Tables may not exist
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="font-serif text-2xl text-text">Exercise Library</h1>
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
