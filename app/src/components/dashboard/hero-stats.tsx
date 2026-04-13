import Link from "next/link";
import { GOALS } from "../../lib/constants";

interface HeroStatsProps {
  weight?: number;
  bodyFat?: number;
  vo2Max?: number;
  swRatio: string | null;
  streak: number;
  totalSessions: number;
  untakenSupplements: number;
  nextWorkoutDay?: string;
}

function ProgressArc({ ratio, target }: { ratio: number; target: number }) {
  const hasData = ratio > 0;
  const progress = hasData ? Math.min(ratio / target, 1) : 0;
  const radius = 54;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg viewBox="0 0 120 68" className="w-full max-w-[160px]">
      <path
        d="M 6 62 A 54 54 0 0 1 114 62"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {hasData && (
        <path
          d="M 6 62 A 54 54 0 0 1 114 62"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      )}
      {hasData ? (
        <>
          <text
            x="60"
            y="52"
            textAnchor="middle"
            className="fill-gold"
            style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600 }}
          >
            {ratio.toFixed(2)}
          </text>
          <text
            x="60"
            y="64"
            textAnchor="middle"
            className="fill-text-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.05em" }}
          >
            TARGET {target}
          </text>
        </>
      ) : (
        <text
          x="60"
          y="54"
          textAnchor="middle"
          className="fill-text-muted"
          style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.02em" }}
        >
          No data yet
        </text>
      )}
    </svg>
  );
}

function ColdStartHero({
  nextWorkoutDay,
  untakenSupplements,
}: Pick<HeroStatsProps, "nextWorkoutDay" | "untakenSupplements">) {
  return (
    <div className="space-y-6">
      <Link
        href="/workout"
        className="block border-2 border-gold/40 rounded-lg px-6 py-6 bg-bg-card hover:border-gold transition-colors group"
      >
        <p className="type-label text-gold mb-2">Today</p>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded bg-gold/20 flex items-center justify-center text-gold text-sm group-hover:bg-gold group-hover:text-bg transition-colors">
            ▶
          </span>
          <div>
            <p className="font-serif text-lg text-text group-hover:text-gold transition-colors">
              {nextWorkoutDay ?? "Start your first workout"}
            </p>
            <p className="type-micro text-text-muted mt-0.5">
              Log sessions, body comp, and supplements to fill your dashboard
            </p>
          </div>
        </div>
        {untakenSupplements > 0 && (
          <p className="type-caption text-text-secondary mt-3 ml-10">
            {untakenSupplements} supplement{untakenSupplements !== 1 ? "s" : ""} remaining today
          </p>
        )}
      </Link>

      <div className="flex items-center gap-6 opacity-50">
        <ProgressArc ratio={0} target={1.57} />
        <div>
          <p className="type-label text-text-muted">Shoulder-to-Waist</p>
          <Link
            href="/body"
            className="type-micro text-gold-dim hover:text-gold transition-colors mt-1 inline-block"
          >
            Log your first measurement →
          </Link>
        </div>
      </div>
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
  untakenSupplements,
  nextWorkoutDay,
}: HeroStatsProps) {
  const ratioNum = swRatio ? parseFloat(swRatio) : 0;
  const hasWorkoutData = totalSessions > 0;
  const hasBodyData = weight !== undefined || bodyFat !== undefined || vo2Max !== undefined;

  if (!hasWorkoutData && !hasBodyData) {
    return (
      <ColdStartHero nextWorkoutDay={nextWorkoutDay} untakenSupplements={untakenSupplements} />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex items-center gap-6 flex-1">
          <ProgressArc ratio={ratioNum} target={GOALS.swRatioTarget} />
          <div>
            <p className="type-label text-text-muted">Shoulder-to-Waist</p>
            {ratioNum > 0 ? (
              <p className="font-serif text-lg text-text mt-1">
                {(
                  ((GOALS.swRatioTarget - ratioNum) /
                    (GOALS.swRatioTarget - GOALS.swRatioBaseline)) *
                  100
                ).toFixed(0)}
                % to go
              </p>
            ) : (
              <Link
                href="/body"
                className="type-micro text-gold-dim hover:text-gold transition-colors mt-1 inline-block"
              >
                Log your first measurement →
              </Link>
            )}
            {ratioNum > 0 && (
              <p className="type-micro text-text-muted mt-1">
                Primary driver: waist reduction through recomp
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 border border-border rounded-lg px-5 py-4 bg-bg-card">
          <p className="type-label text-gold mb-3">Today</p>
          <div className="space-y-2.5">
            {nextWorkoutDay && (
              <Link href="/workout" className="flex items-center gap-3 group">
                <span className="w-5 h-5 rounded bg-gold-muted/50 flex items-center justify-center text-gold type-micro group-hover:bg-gold group-hover:text-bg transition-colors">
                  ▶
                </span>
                <span className="type-secondary text-text group-hover:text-gold transition-colors">
                  {nextWorkoutDay}
                </span>
              </Link>
            )}
            {!nextWorkoutDay && !hasWorkoutData && (
              <Link href="/workout" className="flex items-center gap-3 group">
                <span className="w-5 h-5 rounded bg-gold-muted/50 flex items-center justify-center text-gold type-micro group-hover:bg-gold group-hover:text-bg transition-colors">
                  ▶
                </span>
                <span className="type-secondary text-text group-hover:text-gold transition-colors">
                  Start your first workout
                </span>
              </Link>
            )}
            {untakenSupplements > 0 && (
              <Link href="/supplements" className="flex items-center gap-3 group">
                <span className="w-5 h-5 rounded bg-bg-elevated flex items-center justify-center text-text-muted type-micro group-hover:text-gold transition-colors">
                  +
                </span>
                <span className="type-secondary text-text-secondary group-hover:text-gold transition-colors">
                  {untakenSupplements} supplement{untakenSupplements !== 1 ? "s" : ""} remaining
                </span>
              </Link>
            )}
            {streak > 0 && (
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-bg-elevated flex items-center justify-center text-success type-micro">
                  {streak}
                </span>
                <span className="type-caption text-text-muted">session streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasBodyData && (
        <div className="flex items-center gap-8 px-1">
          <MetricInline label="Weight" value={weight?.toString() ?? "--"} unit="lbs" />
          <Separator />
          <MetricInline
            label="Body Fat"
            value={bodyFat?.toString() ?? "--"}
            unit="%"
            target={GOALS.bodyFatRange}
          />
          <Separator />
          <MetricInline label="VO2 Max" value={vo2Max?.toString() ?? "--"} />
          <Separator />
          <MetricInline label="Sessions" value={totalSessions.toString()} />
        </div>
      )}
      {!hasBodyData && totalSessions > 0 && (
        <div className="flex items-center gap-8 px-1">
          <MetricInline label="Sessions" value={totalSessions.toString()} />
          {streak > 0 && (
            <>
              <Separator />
              <MetricInline label="Streak" value={streak.toString()} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MetricInline({
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
    <div className="flex items-baseline gap-2">
      <span className="type-label text-text-muted">{label}</span>
      <span className="type-data text-text">{value}</span>
      {unit && <span className="type-micro text-text-muted">{unit}</span>}
      {target && <span className="type-micro text-gold-dim">({target})</span>}
    </div>
  );
}

function Separator() {
  return <div className="w-px h-3 bg-border-subtle" />;
}
