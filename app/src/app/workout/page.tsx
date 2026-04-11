"use client";

import { useState, useEffect } from "react";
import { WorkoutSelector } from "../../components/workout/workout-selector";
import { ActiveWorkout } from "../../components/workout/active-workout";
import { WorkoutSummary } from "../../components/workout/workout-summary";

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
    if (!selectedDay) return;
    const today = new Date().toISOString().split("T")[0];
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
  };

  if (phase === "select") {
    return <WorkoutSelector onSelect={handleSelectDay} />;
  }

  if (phase === "active" && selectedDay) {
    return (
      <ActiveWorkout
        day={selectedDay}
        onFinish={handleFinish}
      />
    );
  }

  if (phase === "summary") {
    return (
      <WorkoutSummary
        dayName={selectedDay?.day_name ?? ""}
        sets={loggedSets}
        notes={sessionNotes}
        onSave={handleSave}
        onDiscard={() => {
          setPhase("select");
          setLoggedSets([]);
        }}
      />
    );
  }

  return null;
}
