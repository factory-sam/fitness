import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { ProgrammeDayCard } from "../../../components/programme/programme-day-card";
import { getCurrentProgrammeContext } from "../../../lib/queries";

export const dynamic = "force-dynamic";

const BLOCKS = [
  { name: "Block 1 — Volume", weeks: "1–4", blockLabel: "Block 1" },
  { name: "Block 2 — Intensity", weeks: "5–8", blockLabel: "Block 2" },
  { name: "Block 3 — Strength", weeks: "9–11", blockLabel: "Block 3" },
  { name: "Block 4 — Deload", weeks: "12", blockLabel: "Block 4" },
];

export default async function ProgrammePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: days }, programmeContext] = await Promise.all([
    supabase.from("programme_days").select("*").order("day_number"),
    getCurrentProgrammeContext(),
  ]);

  const exercisesByDay: Record<number, Record<string, unknown>[]> = {};
  for (const day of days ?? []) {
    const { data } = await supabase
      .from("programme_exercises")
      .select("*")
      .eq("day_id", day.id)
      .order("exercise_order");
    exercisesByDay[day.id] = data ?? [];
  }

  const currentBlock = programmeContext.block;
  const programmeName = programmeContext.programme;
  const totalDays = (days ?? []).length;
  const daysPerWeek = totalDays > 0 ? totalDays : null;

  const blocks = BLOCKS.map((b) => ({
    ...b,
    status:
      currentBlock === b.blockLabel
        ? "active"
        : currentBlock && currentBlock > b.blockLabel
          ? "complete"
          : "upcoming",
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="type-heading text-text">Programme</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          {programmeName ?? "No programme set"}
          {daysPerWeek ? ` — ${daysPerWeek}x/week` : ""}
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
                : block.status === "complete"
                  ? "border-success/30 bg-success/5"
                  : "border-border-subtle"
            }`}
          >
            <p
              className={`font-mono text-xs font-medium ${
                block.status === "active"
                  ? "text-gold"
                  : block.status === "complete"
                    ? "text-success"
                    : "text-text-muted"
              }`}
            >
              {block.name.split(" — ")[0]}
            </p>
            <p className="type-micro text-text-muted">Wk {block.weeks}</p>
          </div>
        ))}
      </div>

      {/* Day cards — collapsible, single column */}
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
    </div>
  );
}
