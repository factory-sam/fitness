"use client";

interface Supplement {
  id: number;
  name: string;
  amount: number | null;
  units: string | null;
  time_of_day: string;
  frequency: string;
  notes: string | null;
}

interface LogEntry {
  supplement_id: number;
  taken: number;
  time_taken: string | null;
}

const TIME_LABELS: Record<string, string> = {
  morning: "MORNING",
  "post-workout": "POST-WORKOUT",
  evening: "EVENING",
  any: "ANYTIME",
};

const TIME_ORDER = ["morning", "post-workout", "evening", "any"];

export function TodayStack({
  supplements,
  todayLog,
  onToggle,
}: {
  supplements: Supplement[];
  todayLog: LogEntry[];
  onToggle: (supplementId: number, taken: boolean) => void;
}) {
  const takenIds = new Set(todayLog.filter((l) => l.taken === 1).map((l) => l.supplement_id));

  const grouped = TIME_ORDER.map((time) => ({
    time,
    label: TIME_LABELS[time],
    items: supplements.filter((s) => s.time_of_day === time),
  })).filter((g) => g.items.length > 0);

  const totalActive = supplements.length;
  const totalTaken = takenIds.size;
  const pct = totalActive > 0 ? Math.round((totalTaken / totalActive) * 100) : 0;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading">Today&apos;s Stack</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-secondary">
            {totalTaken}/{totalActive}
          </span>
          <div className="w-24 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-success">{pct}%</span>
        </div>
      </div>

      {grouped.length === 0 && (
        <p className="font-mono text-sm text-text-muted py-8 text-center">
          No supplements configured. Add your stack below.
        </p>
      )}

      {grouped.map((group) => (
        <div key={group.time}>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="type-label text-text-muted">{group.label}</span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>
          <div className="space-y-1">
            {group.items.map((supp) => {
              const taken = takenIds.has(supp.id);
              return (
                <button
                  key={supp.id}
                  onClick={() => onToggle(supp.id, !taken)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-left group min-w-0 ${
                    taken
                      ? "bg-success/10 border border-success/30"
                      : "bg-bg-elevated/50 border border-border-subtle hover:border-gold-dim/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      taken
                        ? "bg-success border-success text-bg"
                        : "border-border hover:border-gold-dim"
                    }`}
                  >
                    {taken && (
                      <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`font-mono text-sm flex-1 truncate ${
                      taken ? "text-success line-through opacity-60" : "text-text"
                    }`}
                  >
                    {supp.name}
                  </span>
                  {supp.amount != null && (
                    <span className="font-mono text-xs text-text-muted">
                      {supp.amount}
                      {supp.units ?? ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
