"use client";

import { useState } from "react";

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

interface Props {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: ProgrammeExercise[];
  defaultOpen?: boolean;
}

export function ProgrammeDayCard({
  dayNumber,
  dayName,
  focus,
  exercises,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const warmups = exercises.filter((e) => e.is_warmup);
  const working = exercises.filter((e) => !e.is_warmup);

  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between gap-4 cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-xs text-gold-dim shrink-0">
            Day {dayNumber}
          </span>
          <div className="min-w-0">
            <h3 className="font-mono text-sm text-text font-medium">
              {dayName}
            </h3>
            <p className="type-micro text-text-muted">{focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="type-micro text-text-muted">
            {working.length} exercises
          </span>
          <span
            className={`text-text-muted transition-transform duration-200 text-xs ${
              open ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-4 border-t border-border-subtle pt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Exercise</th>
                <th>Sets x Reps</th>
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
                  <td>--</td>
                  <td>--</td>
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
                    {ex.sets ? `${ex.sets}x${ex.reps}` : ex.reps}
                  </td>
                  <td>{ex.target_rpe ?? "--"}</td>
                  <td>{ex.rest_seconds ? `${ex.rest_seconds}s` : "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
