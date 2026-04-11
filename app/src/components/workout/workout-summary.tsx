"use client";

import type { LoggedSet } from "../../app/(app)/workout/page";

export function WorkoutSummary({
  dayName,
  sets,
  notes,
  onSave,
  onDiscard,
  saving = false,
}: {
  dayName: string;
  sets: LoggedSet[];
  notes: string;
  onSave: () => void;
  onDiscard: () => void;
  saving?: boolean;
}) {
  const exercises = new Map<string, LoggedSet[]>();
  for (const s of sets) {
    if (!exercises.has(s.exercise)) exercises.set(s.exercise, []);
    exercises.get(s.exercise)!.push(s);
  }

  const totalVolume = sets.reduce(
    (sum, s) => sum + (s.reps ?? 0) * (s.weight ?? 0),
    0
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="type-heading text-text mb-1">Session Complete</h1>
      <p className="font-mono text-xs text-text-muted mb-6">{dayName}</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <p className="metric-label">Exercises</p>
          <p className="metric-value text-lg">{exercises.size}</p>
        </div>
        <div className="card text-center">
          <p className="metric-label">Sets</p>
          <p className="metric-value text-lg">{sets.length}</p>
        </div>
        <div className="card text-center">
          <p className="metric-label">Volume</p>
          <p className="metric-value text-lg">
            {totalVolume > 0 ? totalVolume.toLocaleString() : "—"}
          </p>
          {totalVolume > 0 && (
            <p className="type-micro text-text-muted">lbs</p>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="section-heading mb-3">Summary</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Best Set</th>
              <th>RPE</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(exercises.entries()).map(([name, exSets]) => {
              const bestSet = exSets.reduce((best, s) =>
                (s.weight ?? 0) > (best.weight ?? 0) ? s : best
              );
              const avgRpe =
                exSets.filter((s) => s.rpe).length > 0
                  ? (
                      exSets.reduce((sum, s) => sum + (s.rpe ?? 0), 0) /
                      exSets.filter((s) => s.rpe).length
                    ).toFixed(1)
                  : "—";

              return (
                <tr key={name}>
                  <td className="text-text">{name}</td>
                  <td>{exSets.length}</td>
                  <td className="text-gold">
                    {bestSet.weight
                      ? `${bestSet.weight} lbs × ${bestSet.reps}`
                      : bestSet.duration_sec
                      ? `${bestSet.duration_sec}s`
                      : "BW"}
                  </td>
                  <td>{avgRpe}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {notes && (
        <div className="card mb-6">
          <h2 className="section-heading mb-2">Notes</h2>
          <p className="font-mono text-xs text-text-secondary">{notes}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 font-mono text-sm py-3 rounded bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save to Log"}
        </button>
        <button
          onClick={onDiscard}
          disabled={saving}
          className="font-mono text-sm py-3 px-6 rounded border border-border text-text-secondary hover:border-error hover:text-error transition-colors disabled:opacity-50"
        >
          Discard
        </button>
      </div>
    </div>
  );
}
