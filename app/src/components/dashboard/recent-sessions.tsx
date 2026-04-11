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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3 opacity-20">▶</span>
          <p className="font-mono text-sm text-text-secondary">No sessions logged yet</p>
          <p className="font-mono text-xs text-text-muted mt-1">
            Complete your first workout to see it here
          </p>
        </div>
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
