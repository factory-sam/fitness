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
          <p className="font-mono text-sm text-text-secondary">
            No sessions logged yet
          </p>
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
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Session</th>
            <th>Block</th>
            <th>Week</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr key={s.id ?? i}>
              <td className="text-gold">{s.date}</td>
              <td>{s.name}</td>
              <td>{s.block ?? "—"}</td>
              <td>{s.week ?? "—"}</td>
              <td className="text-text-muted max-w-48 truncate">
                {s.notes ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
