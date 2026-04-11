interface PR {
  exercise?: string;
  max_weight?: number;
  weight_unit?: string;
  date?: string;
  [key: string]: unknown;
}

export function PRBoard({ prs }: { prs: PR[] }) {
  if (prs.length === 0) {
    return (
      <div className="card">
        <h2 className="section-heading mb-3">Personal Records</h2>
        <div className="py-6 text-center">
          <span className="text-2xl opacity-20">🏆</span>
          <p className="font-mono text-xs text-text-muted mt-2">
            PRs appear after logging sessions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-heading mb-3">Personal Records</h2>
      <div className="space-y-2">
        {prs.map((pr, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0"
          >
            <span className="font-mono text-xs text-text">
              {pr.exercise}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-sm font-semibold text-gold">
                {pr.max_weight}
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {pr.weight_unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
