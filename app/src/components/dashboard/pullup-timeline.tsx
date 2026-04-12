interface PullUpTimelineProps {
  exerciseNames?: string[];
}

const MILESTONES = [
  {
    label: "Dead Hangs + Lat Pulldowns",
    detail: "Block 1 — Building grip & lat strength",
    matchExercises: ["dead hang", "lat pulldown"],
  },
  {
    label: "Band-Assisted Negatives",
    detail: "Block 2 — 3-5 sec eccentrics",
    matchExercises: ["band-assisted negative", "negative pull-up", "band negative"],
  },
  {
    label: "Band-Assisted Pull-Ups",
    detail: "Block 3 — Full reps with band",
    matchExercises: ["band-assisted pull-up", "band pull-up"],
  },
  {
    label: "Unassisted Pull-Up",
    detail: "Goal — Test at Week 12",
    matchExercises: ["pull-up", "pullup", "chin-up", "chinup"],
  },
];

function deriveStatuses(exerciseNames: string[]) {
  const lower = exerciseNames.map((n) => n.toLowerCase());
  let lastCompleted = -1;
  for (let i = 0; i < MILESTONES.length; i++) {
    const hasMatch = MILESTONES[i].matchExercises.some((me) => lower.some((en) => en.includes(me)));
    if (hasMatch) lastCompleted = i;
  }

  return MILESTONES.map((m, i) => ({
    label: m.label,
    detail: m.detail,
    status: (i < lastCompleted
      ? "complete"
      : i === lastCompleted
        ? "active"
        : i === lastCompleted + 1
          ? "active"
          : "upcoming") as "active" | "complete" | "upcoming",
  }));
}

export function PullUpTimeline({ exerciseNames = [] }: PullUpTimelineProps) {
  const milestones = deriveStatuses(exerciseNames);
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
