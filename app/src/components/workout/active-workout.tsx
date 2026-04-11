"use client";

import { useState, useEffect, useCallback } from "react";
import { RestTimer, StopwatchTimer } from "./rest-timer";
import { SupplementReminder } from "./supplement-reminder";
import type { LoggedSet } from "../../app/(app)/workout/page";

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

interface ProgrammeDay {
  day_name: string;
  focus: string;
  exercises: ProgrammeExercise[];
}

interface SetEntry {
  reps: string;
  weight: string;
  rpe: string;
  done: boolean;
  duration_sec?: number;
}

export function ActiveWorkout({
  day,
  onFinish,
}: {
  day: ProgrammeDay;
  onFinish: (sets: LoggedSet[], notes: string) => void;
}) {
  const workingExercises = day.exercises.filter((e) => !e.is_warmup);
  const warmupExercises = day.exercises.filter((e) => e.is_warmup);

  const [exerciseSets, setExerciseSets] = useState<
    Record<string, SetEntry[]>
  >(() => {
    const initial: Record<string, SetEntry[]> = {};
    for (const ex of workingExercises) {
      const numSets = ex.sets ?? 1;
      initial[ex.exercise] = Array.from({ length: numSets }, () => ({
        reps: ex.reps?.replace("/side", "").replace("/arm", "").replace("/leg", "") ?? "",
        weight: "",
        rpe: ex.target_rpe?.toString() ?? "",
        done: false,
      }));
    }
    return initial;
  });

  const [warmupsDone, setWarmupsDone] = useState<Set<string>>(new Set());
  const [restTimer, setRestTimer] = useState<{
    active: boolean;
    seconds: number;
  }>({ active: false, seconds: 0 });
  const [stopwatch, setStopwatch] = useState<{
    active: boolean;
    exercise: string;
    setIdx: number;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const updateSet = (
    exercise: string,
    setIdx: number,
    field: keyof SetEntry,
    value: string
  ) => {
    setExerciseSets((prev) => {
      const copy = { ...prev };
      copy[exercise] = [...copy[exercise]];
      copy[exercise][setIdx] = { ...copy[exercise][setIdx], [field]: value };
      return copy;
    });
  };

  const completeSet = (exercise: string, setIdx: number, restSec: number) => {
    setExerciseSets((prev) => {
      const copy = { ...prev };
      copy[exercise] = [...copy[exercise]];
      copy[exercise][setIdx] = { ...copy[exercise][setIdx], done: true };
      return copy;
    });
    if (restSec > 0) {
      setRestTimer({ active: true, seconds: restSec });
    }
  };

  const handleStopwatchStop = useCallback(
    (exercise: string, setIdx: number, elapsed: number) => {
      setExerciseSets((prev) => {
        const copy = { ...prev };
        copy[exercise] = [...copy[exercise]];
        copy[exercise][setIdx] = {
          ...copy[exercise][setIdx],
          done: true,
          duration_sec: elapsed,
        };
        return copy;
      });
      setStopwatch(null);
    },
    []
  );

  const handleFinish = () => {
    const allSets: LoggedSet[] = [];
    let setCounter = 1;
    for (const ex of workingExercises) {
      const sets = exerciseSets[ex.exercise] ?? [];
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        if (s.done) {
          allSets.push({
            exercise: ex.exercise,
            set_number: setCounter++,
            reps: s.reps ? parseInt(s.reps) || null : null,
            weight: s.weight ? parseFloat(s.weight) || null : null,
            weight_unit: "lbs",
            rpe: s.rpe ? parseFloat(s.rpe) || null : null,
            duration_sec: s.duration_sec ?? null,
            is_calibration: 0,
            notes: "",
          });
        }
      }
    }
    onFinish(allSets, notes);
  };

  const isDeadHang = (name: string) =>
    name.toLowerCase().includes("dead hang");

  const totalSets = Object.values(exerciseSets).flat().length;
  const doneSets = Object.values(exerciseSets)
    .flat()
    .filter((s) => s.done).length;

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-xl text-text">{day.day_name}</h1>
          <p className="font-mono text-xs text-text-muted">{day.focus}</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-sm text-gold">
            {doneSets}/{totalSets}
          </span>
          <p className="type-micro text-text-muted">sets done</p>
        </div>
      </header>

      {/* Rest Timer Overlay */}
      {restTimer.active && (
        <div className="fixed inset-0 bg-bg/90 z-50 flex items-center justify-center">
          <div className="card text-center">
            <p className="font-mono text-xs text-text-secondary mb-2">REST</p>
            <RestTimer
              seconds={restTimer.seconds}
              onComplete={() => setRestTimer({ active: false, seconds: 0 })}
            />
          </div>
        </div>
      )}

      {/* Stopwatch Overlay */}
      {stopwatch && (
        <div className="fixed inset-0 bg-bg/90 z-50 flex items-center justify-center">
          <div className="card text-center">
            <p className="font-mono text-xs text-text-secondary mb-2">
              {stopwatch.exercise}
            </p>
            <StopwatchTimer
              onStop={(elapsed) =>
                handleStopwatchStop(
                  stopwatch.exercise,
                  stopwatch.setIdx,
                  elapsed
                )
              }
            />
          </div>
        </div>
      )}

      {/* Supplement reminder */}
      <SupplementReminder />

      {/* Warm-up section */}
      {warmupExercises.length > 0 && (
        <div className="mb-6">
          <h2 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
            Warm-Up
          </h2>
          <div className="space-y-1">
            {warmupExercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center gap-3 py-2 px-3 rounded bg-bg-elevated"
              >
                <button
                  onClick={() =>
                    setWarmupsDone((prev) => {
                      const next = new Set(prev);
                      next.has(ex.exercise)
                        ? next.delete(ex.exercise)
                        : next.add(ex.exercise);
                      return next;
                    })
                  }
                  className={`w-4 h-4 rounded border shrink-0 transition-colors ${
                    warmupsDone.has(ex.exercise)
                      ? "bg-gold border-gold"
                      : "border-border hover:border-gold-dim"
                  }`}
                />
                <div className="flex-1">
                  <span
                    className={`font-mono text-xs ${
                      warmupsDone.has(ex.exercise)
                        ? "text-text-muted line-through"
                        : "text-text"
                    }`}
                  >
                    {ex.exercise}
                  </span>
                  <span className="type-micro text-text-muted ml-2">
                    {ex.reps}
                  </span>
                </div>
                {ex.notes && (
                  <span className="type-micro text-text-muted">
                    {ex.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Working exercises */}
      <div className="space-y-4">
        {workingExercises.map((ex) => {
          const sets = exerciseSets[ex.exercise] ?? [];
          const isHang = isDeadHang(ex.exercise);

          return (
            <div key={ex.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    {ex.superset_group && (
                      <span className="type-micro px-1.5 py-0.5 rounded bg-gold-muted text-gold">
                        {ex.superset_group}
                      </span>
                    )}
                    <span className="font-mono text-sm text-text font-medium truncate">
                      {ex.exercise}
                    </span>
                  </div>
                  {ex.notes && (
                    <p className="type-micro text-text-muted mt-0.5">
                      {ex.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="type-micro text-text-muted">
                    {ex.sets}×{ex.reps}
                    {ex.target_rpe ? ` @ RPE ${ex.target_rpe}` : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {sets.map((s, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${
                      s.done ? "opacity-50" : ""
                    }`}
                  >
                    <span className="type-micro text-text-muted w-6">
                      {idx + 1}
                    </span>

                    {isHang ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="sec"
                          value={s.duration_sec ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExerciseSets((prev) => {
                              const copy = { ...prev };
                              copy[ex.exercise] = [...copy[ex.exercise]];
                              copy[ex.exercise][idx] = {
                                ...copy[ex.exercise][idx],
                                duration_sec: val ? parseInt(val) : undefined,
                              };
                              return copy;
                            });
                          }}
                          disabled={s.done}
                          min="0"
                          className="w-16 bg-bg-input border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:border-gold-dim focus:outline-none disabled:opacity-30"
                        />
                        <span className="type-micro text-text-muted">s</span>
                        {!s.done && (
                          <>
                            <button
                              onClick={() =>
                                setStopwatch({
                                  active: true,
                                  exercise: ex.exercise,
                                  setIdx: idx,
                                })
                              }
                              className="font-mono text-xs px-2.5 py-1.5 rounded bg-bg-elevated hover:bg-gold-muted text-gold-dim hover:text-gold transition-colors"
                              title="Use stopwatch"
                            >
                              ⏱
                            </button>
                            <button
                              onClick={() => {
                                setExerciseSets((prev) => {
                                  const copy = { ...prev };
                                  copy[ex.exercise] = [...copy[ex.exercise]];
                                  copy[ex.exercise][idx] = {
                                    ...copy[ex.exercise][idx],
                                    done: true,
                                    duration_sec: copy[ex.exercise][idx].duration_sec || undefined,
                                  };
                                  return copy;
                                });
                              }}
                              className="type-micro px-2 py-1.5 rounded bg-bg-elevated hover:bg-gold-muted text-gold-dim hover:text-gold transition-colors"
                            >
                              ✓
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="number"
                          placeholder="wt"
                          value={s.weight}
                          onChange={(e) =>
                            updateSet(
                              ex.exercise,
                              idx,
                              "weight",
                              e.target.value
                            )
                          }
                          disabled={s.done}
                          className="w-16 bg-bg-input border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:border-gold-dim focus:outline-none disabled:opacity-30"
                        />
                        <input
                          type="number"
                          placeholder="reps"
                          value={s.reps}
                          onChange={(e) =>
                            updateSet(
                              ex.exercise,
                              idx,
                              "reps",
                              e.target.value
                            )
                          }
                          disabled={s.done}
                          className="w-14 bg-bg-input border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:border-gold-dim focus:outline-none disabled:opacity-30"
                        />
                        <input
                          type="number"
                          placeholder="RPE"
                          value={s.rpe}
                          onChange={(e) =>
                            updateSet(
                              ex.exercise,
                              idx,
                              "rpe",
                              e.target.value
                            )
                          }
                          disabled={s.done}
                          step="0.5"
                          className="w-14 bg-bg-input border border-border rounded px-2 py-1.5 font-mono text-xs text-text focus:border-gold-dim focus:outline-none disabled:opacity-30"
                        />
                      </>
                    )}

                    {!s.done && !isHang && (
                      <button
                        onClick={() =>
                          completeSet(
                            ex.exercise,
                            idx,
                            ex.rest_seconds ?? 60
                          )
                        }
                        className="type-micro px-2 py-1.5 rounded bg-bg-elevated hover:bg-gold-muted text-gold-dim hover:text-gold transition-colors"
                      >
                        ✓
                      </button>
                    )}

                    {s.done && (
                      <span className="type-micro text-success">
                        ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish confirmation */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-bg/90 z-50 flex items-center justify-center">
          <div className="card max-w-sm w-full mx-4 space-y-4">
            <h3 className="section-heading">Finish workout?</h3>
            <p className="type-secondary text-text-secondary">
              {doneSets}/{totalSets} sets completed.
              {doneSets < totalSets && ` ${totalSets - doneSets} sets will not be logged.`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  handleFinish();
                }}
                className="flex-1 font-mono text-sm py-2.5 rounded bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors"
              >
                Finish
              </button>
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 font-mono text-sm py-2.5 rounded border border-border text-text-secondary hover:border-gold-dim transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session notes + finish */}
      <div className="mt-6 space-y-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Session notes (energy, how it felt, anything notable)..."
          className="w-full bg-bg-input border border-border rounded px-3 py-2 font-mono text-xs text-text focus:border-gold-dim focus:outline-none resize-none h-20"
        />
        <button
          onClick={() => setShowFinishConfirm(true)}
          className="w-full font-mono text-sm py-3 rounded bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors"
        >
          Finish Workout →
        </button>
      </div>
    </div>
  );
}
