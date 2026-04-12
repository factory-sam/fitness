import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { ProgrammeDayCard } from "../../../components/programme/programme-day-card";
import { EmptyState } from "../../../components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: days } = await supabase.from("programme_days").select("*").order("day_number");

  const exercisesByDay: Record<number, Record<string, unknown>[]> = {};
  for (const day of days ?? []) {
    const { data } = await supabase
      .from("programme_exercises")
      .select("*")
      .eq("day_id", day.id)
      .order("exercise_order");
    exercisesByDay[day.id] = data ?? [];
  }

  const blocks = [
    { name: "Block 1 — Volume", weeks: "1–4", status: "active" },
    { name: "Block 2 — Intensity", weeks: "5–8", status: "upcoming" },
    { name: "Block 3 — Strength", weeks: "9–11", status: "upcoming" },
    { name: "Block 4 — Deload", weeks: "12", status: "upcoming" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="type-heading text-text">Programme</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          RECOMP I — 12 Weeks — Upper/Lower 4x/week
        </p>
      </header>

      {/* Block progression — compact inline */}
      <div className="flex items-center gap-1">
        {blocks.map((block, i) => (
          <div
            key={i}
            className={`flex-1 px-3 py-2 rounded-md border text-center ${
              block.status === "active"
                ? "border-gold-dim bg-gold-muted/20"
                : "border-border-subtle"
            }`}
          >
            <p
              className={`font-mono text-xs font-medium ${
                block.status === "active" ? "text-gold" : "text-text-muted"
              }`}
            >
              {block.name.split(" — ")[0]}
            </p>
            <p className="type-micro text-text-muted">Wk {block.weeks}</p>
          </div>
        ))}
      </div>

      {/* Day cards — collapsible, single column */}
      {(days ?? []).length === 0 ? (
        <div className="card">
          <EmptyState
            icon="▦"
            title="No programme configured"
            description="A training programme defines your weekly workout split — exercises, sets, reps, and rest periods for each day. Configure one to start tracking structured workouts."
            action={{ label: "Start Workout", href: "/workout" }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {(days ?? []).map((day, i) => (
            <ProgrammeDayCard
              key={day.id}
              dayNumber={day.day_number}
              dayName={day.day_name}
              focus={day.focus ?? ""}
              exercises={
                (exercisesByDay[day.id] ?? []).map((e: Record<string, unknown>) => ({
                  ...e,
                  is_warmup: e.is_warmup ? 1 : 0,
                })) as Parameters<typeof ProgrammeDayCard>[0]["exercises"]
              }
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
