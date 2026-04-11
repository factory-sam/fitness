interface HeroStatsProps {
  weight?: number;
  bodyFat?: number;
  vo2Max?: number;
  swRatio: string | null;
  streak: number;
  totalSessions: number;
}

function StatCard({
  label,
  value,
  unit,
  target,
}: {
  label: string;
  value: string;
  unit?: string;
  target?: string;
}) {
  return (
    <div className="card flex flex-col gap-1.5">
      <span className="metric-label">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="metric-value">{value}</span>
        {unit && (
          <span className="font-mono text-sm text-text-secondary">{unit}</span>
        )}
      </div>
      {target && (
        <span className="font-mono text-[10px] text-text-muted">
          Target: {target}
        </span>
      )}
    </div>
  );
}

export function HeroStats({
  weight,
  bodyFat,
  vo2Max,
  swRatio,
  streak,
  totalSessions,
}: HeroStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="Weight"
        value={weight?.toString() ?? "—"}
        unit="lbs"
        target="< 195"
      />
      <StatCard
        label="Body Fat"
        value={bodyFat?.toString() ?? "—"}
        unit="%"
        target="12–18%"
      />
      <StatCard
        label="VO₂ Max"
        value={vo2Max?.toString() ?? "—"}
      />
      <StatCard
        label="S/W Ratio"
        value={swRatio ?? "—"}
        target="1.57"
      />
      <StatCard
        label="Streak"
        value={streak.toString()}
        unit="sessions"
      />
      <StatCard
        label="Total"
        value={totalSessions.toString()}
        unit="sessions"
      />
    </div>
  );
}
