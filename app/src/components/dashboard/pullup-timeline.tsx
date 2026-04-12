const milestones: { label: string; status: "active" | "complete" | "upcoming"; detail: string }[] =
  [
    {
      label: "Dead Hangs + Lat Pulldowns",
      status: "active" as const,
      detail: "Block 1 — Building grip & lat strength",
    },
    {
      label: "Band-Assisted Negatives",
      status: "upcoming" as const,
      detail: "Block 2 — 3-5 sec eccentrics",
    },
    {
      label: "Band-Assisted Pull-Ups",
      status: "upcoming" as const,
      detail: "Block 3 — Full reps with band",
    },
    {
      label: "Unassisted Pull-Up",
      status: "upcoming" as const,
      detail: "Goal — Test at Week 12",
    },
  ];

export function PullUpTimeline() {
  return (
    <div className="card">
      <h2 className="section-heading mb-3">Pull-Up Progression</h2>
      <div className="space-y-0">
        {milestones.map((m, i) => (
          <div key={i} className="flex gap-3 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  m.status === "active"
                    ? "bg-gold shadow-[0_0_6px_rgba(201,168,76,0.4)]"
                    : m.status === "complete"
                      ? "bg-success"
                      : "bg-border"
                }`}
              />
              {i < milestones.length - 1 && (
                <div
                  className={`w-px flex-1 mt-1 ${
                    m.status === "active" || m.status === "complete"
                      ? "bg-gold-dim"
                      : "bg-border-subtle"
                  }`}
                />
              )}
            </div>
            <div className="pb-1">
              <p
                className={`font-mono text-xs ${
                  m.status === "active" ? "text-text" : "text-text-secondary"
                }`}
              >
                {m.label}
              </p>
              <p className="type-micro text-text-muted">{m.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
