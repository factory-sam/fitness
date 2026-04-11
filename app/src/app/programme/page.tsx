import { getDb } from "../../lib/db";

export const dynamic = "force-dynamic";

interface ProgrammeDay {
  id: number;
  programme: string;
  day_number: number;
  day_name: string;
  focus: string;
}

interface ProgrammeExercise {
  id: number;
  exercise_order: number;
  exercise: string;
  sets: number | null;
  reps: string;
  target_rpe: number | null;
  rest_seconds: number | null;
  is_warmup: number;
  superset_group: string | null;
  notes: string | null;
}

export default function ProgrammePage() {
  const db = getDb();

  let days: ProgrammeDay[] = [];
  let exercisesByDay: Record<number, ProgrammeExercise[]> = {};
  try {
    days = db.prepare("SELECT * FROM programme_days ORDER BY day_number").all() as ProgrammeDay[];
    for (const day of days) {
      exercisesByDay[day.id] = db
        .prepare("SELECT * FROM programme_exercises WHERE day_id = ? ORDER BY exercise_order")
        .all(day.id) as ProgrammeExercise[];
    }
  } catch {
    // Tables may not exist yet
  }

  const blocks = [
    { name: "Block 1 — Volume", weeks: "1–4", status: "active" },
    { name: "Block 2 — Intensity", weeks: "5–8", status: "upcoming" },
    { name: "Block 3 — Strength", weeks: "9–11", status: "upcoming" },
    { name: "Block 4 — Deload", weeks: "12", status: "upcoming" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="type-heading text-text">Programme</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          RECOMP I — 12 Weeks — Upper/Lower 4×/week
        </p>
      </header>

      {/* Block progression */}
      <div className="flex gap-2">
        {blocks.map((block, i) => (
          <div
            key={i}
            className={`flex-1 card ${
              block.status === "active" ? "tui-border-gold" : ""
            }`}
          >
            <p
              className={`font-mono text-xs font-medium ${
                block.status === "active" ? "text-gold" : "text-text-secondary"
              }`}
            >
              {block.name}
            </p>
            <p className="type-micro text-text-muted">
              Weeks {block.weeks}
            </p>
            {block.status === "active" && (
              <span className="inline-block mt-1 type-micro px-1.5 py-0.5 rounded bg-gold-muted text-gold">
                CURRENT
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {days.map((day) => {
          const exercises = exercisesByDay[day.id] ?? [];
          const warmups = exercises.filter((e) => e.is_warmup);
          const working = exercises.filter((e) => !e.is_warmup);

          return (
            <div key={day.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-mono text-xs text-gold-dim">
                    Day {day.day_number}
                  </span>
                  <h3 className="font-mono text-sm text-text font-medium">
                    {day.day_name}
                  </h3>
                  <p className="type-micro text-text-muted">
                    {day.focus}
                  </p>
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Exercise</th>
                    <th>Sets × Reps</th>
                    <th>RPE</th>
                    <th>Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {warmups.length > 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="type-label text-text-muted pt-2"
                      >
                        Warm-Up
                      </td>
                    </tr>
                  )}
                  {warmups.map((ex) => (
                    <tr key={ex.id} className="opacity-50">
                      <td></td>
                      <td>{ex.exercise}</td>
                      <td>{ex.reps}</td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                  ))}
                  {working.length > 0 && warmups.length > 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="type-label text-text-muted pt-2"
                      >
                        Working Sets
                      </td>
                    </tr>
                  )}
                  {working.map((ex) => (
                    <tr key={ex.id}>
                      <td>
                        {ex.superset_group && (
                          <span className="type-micro px-1 py-0.5 rounded bg-gold-muted text-gold">
                            {ex.superset_group}
                          </span>
                        )}
                      </td>
                      <td className="text-text">{ex.exercise}</td>
                      <td>
                        {ex.sets ? `${ex.sets}×${ex.reps}` : ex.reps}
                      </td>
                      <td>{ex.target_rpe ?? "—"}</td>
                      <td>{ex.rest_seconds ? `${ex.rest_seconds}s` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
