"use client";

import { useState } from "react";
import { getLocalDateString } from "../../../lib/date";
import { WorkoutSelector } from "../../../components/workout/workout-selector";
import { ActiveWorkout } from "../../../components/workout/active-workout";
import { WorkoutSummary } from "../../../components/workout/workout-summary";

interface ProgrammeDay {
  id: number;
  programme: string;
  day_number: number;
  day_name: string;
  focus: string;
  exercises: ProgrammeExercise[];
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

export interface LoggedSet {
  exercise: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  weight_unit: string;
  rpe: number | null;
  duration_sec: number | null;
  is_calibration: number;
  notes: string;
}

type Phase = "select" | "active" | "summary";

export default function WorkoutPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedDay, setSelectedDay] = useState<ProgrammeDay | null>(null);
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const [sessionNotes, setSessionNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleSelectDay = async (dayNumber: number) => {
    const res = await fetch(`/api/programme?day=${dayNumber}`);
    const data = await res.json();
    setSelectedDay(data);
    setPhase("active");
  };

  const handleFinish = (sets: LoggedSet[], notes: string) => {
    setLoggedSets(sets);
    setSessionNotes(notes);
    setPhase("summary");
  };

  const handleSave = async () => {
    if (!selectedDay || saving) return;
    setSaving(true);
    try {
      const today = getLocalDateString();
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          name: selectedDay.day_name,
          programme: selectedDay.programme,
          block: "Block 1",
          week: 1,
          notes: sessionNotes,
          sets: loggedSets,
        }),
      });
      if (res.ok) {
        setPhase("select");
        setSelectedDay(null);
        setLoggedSets([]);
        setSessionNotes("");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    setPhase("select");
    setLoggedSets([]);
    setShowDiscardConfirm(false);
  };

  if (phase === "select") {
    return <WorkoutSelector onSelect={handleSelectDay} />;
  }

  if (phase === "active" && selectedDay) {
    return <ActiveWorkout day={selectedDay} onFinish={handleFinish} />;
  }

  if (phase === "summary") {
    return (
      <>
        {showDiscardConfirm && (
          <div className="fixed inset-0 bg-bg/90 z-50 flex items-center justify-center">
            <div className="card max-w-sm w-full mx-4 space-y-4">
              <h3 className="section-heading">Discard workout?</h3>
              <p className="type-secondary text-text-secondary">
                This will delete all {loggedSets.length} logged sets. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmDiscard}
                  className="flex-1 font-mono text-sm py-2.5 rounded bg-error text-text font-semibold hover:opacity-90 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-4 font-mono text-sm py-2.5 rounded border border-border text-text-secondary hover:border-gold-dim transition-colors"
                >
                  Keep
                </button>
              </div>
            </div>
          </div>
        )}
        <WorkoutSummary
          dayName={selectedDay?.day_name ?? ""}
          sets={loggedSets}
          notes={sessionNotes}
          onSave={handleSave}
          onDiscard={handleDiscard}
          saving={saving}
        />
      </>
    );
  }

  return null;
}
