import { EmptyState } from "../ui/empty-state";

interface Session {
  id?: number;
  date?: string;
  name?: string;
  programme?: string;
  block?: string;
  week?: number;
  notes?: string;
  [key: string]: unknown;
}

export function RecentSessions({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="card">
        <h2 className="section-heading mb-4">Recent Sessions</h2>
        <EmptyState
          icon="▶"
          title="No sessions logged yet"
          description="Your recent workout sessions will appear here. Log your first workout to start tracking progress."
          action={{ label: "Start Workout", href: "/workout" }}
          secondaryAction={{ label: "Set Up Programme", href: "/programme" }}
        />
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-heading mb-4">Recent Sessions</h2>
      <div className="space-y-0">
        {sessions.map((s, i) => (
          <div
            key={s.id ?? i}
            className="flex items-baseline justify-between py-2 border-b border-border-subtle last:border-0"
          >
            <div className="min-w-0">
              <span className="font-mono text-sm text-text">{s.name}</span>
              {s.notes && s.notes !== "—" && (
                <p className="type-micro text-text-muted truncate mt-0.5">{s.notes}</p>
              )}
            </div>
            <span className="font-mono text-xs text-text-muted shrink-0 ml-3">{s.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
