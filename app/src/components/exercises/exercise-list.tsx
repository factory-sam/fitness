"use client";

import { useState } from "react";
import { EmptyState } from "../ui/empty-state";

interface LoggedExercise {
  exercise: string;
  count: number;
  max_weight: number | null;
  last_date: string;
}

export function ExerciseList({
  programmeExercises,
  loggedExercises,
}: {
  programmeExercises: string[];
  loggedExercises: LoggedExercise[];
}) {
  const [search, setSearch] = useState("");
  const loggedMap = new Map(loggedExercises.map((e) => [e.exercise, e]));

  const allExercises = [
    ...new Set([...programmeExercises, ...loggedExercises.map((e) => e.exercise)]),
  ].sort();

  const filtered = allExercises.filter((e) => e.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg-input border border-border rounded px-3 py-2 font-mono text-sm text-text focus:border-gold-dim focus:outline-none"
        />
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Sets Logged</th>
              <th>Best Weight</th>
              <th>Last Used</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exercise) => {
              const logged = loggedMap.get(exercise);
              const inProgramme = programmeExercises.includes(exercise);

              return (
                <tr key={exercise}>
                  <td className="text-text">{exercise}</td>
                  <td>{logged?.count ?? "—"}</td>
                  <td className="text-gold">
                    {logged?.max_weight ? `${logged.max_weight} lbs` : "—"}
                  </td>
                  <td className="text-text-muted">{logged?.last_date ?? "—"}</td>
                  <td>
                    {inProgramme && (
                      <span className="type-micro px-1.5 py-0.5 rounded bg-gold-muted text-gold">
                        ACTIVE
                      </span>
                    )}
                    {!inProgramme && logged && (
                      <span className="type-micro px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">
                        LOGGED
                      </span>
                    )}
                    {!inProgramme && !logged && (
                      <span className="type-micro text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  {search ? (
                    <div className="text-center text-text-muted py-8">
                      <p className="font-mono text-sm">
                        No exercises matching &ldquo;{search}&rdquo;
                      </p>
                      <button
                        onClick={() => setSearch("")}
                        className="font-mono text-xs text-gold hover:text-gold-bright mt-2 transition-colors"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <EmptyState
                      icon="≡"
                      title="No exercises in your library"
                      description="Exercises appear here from your programme and logged workouts. Set up a training programme to populate your exercise library."
                      action={{ label: "Set Up Programme", href: "/programme" }}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
