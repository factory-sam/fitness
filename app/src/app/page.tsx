import {
  getLatestBodyComp,
  getLatestMeasurements,
  getRecentSessions,
  getSessionDates,
  getWorkoutStreak,
  getPersonalRecords,
  getBodyCompHistory,
  getMeasurements,
} from "../lib/queries";
import { HeroStats } from "../components/dashboard/hero-stats";
import { RecentSessions } from "../components/dashboard/recent-sessions";
import { BodyCompChart } from "../components/dashboard/body-comp-chart";
import { ConsistencyCalendar } from "../components/dashboard/consistency-calendar";
import { PRBoard } from "../components/dashboard/pr-board";
import { PullUpTimeline } from "../components/dashboard/pullup-timeline";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const bodyComp = getLatestBodyComp() as Record<string, unknown> | undefined;
  const measurements = getLatestMeasurements() as Record<string, unknown> | undefined;
  const recentSessions = getRecentSessions(5) as Record<string, unknown>[];
  const allDates = getSessionDates() as { date: string }[];
  const streak = getWorkoutStreak();
  const prs = getPersonalRecords() as Record<string, unknown>[];
  const bodyCompHistory = getBodyCompHistory() as Record<string, unknown>[];
  const measurementHistory = getMeasurements() as Record<string, unknown>[];

  const swRatio =
    measurements?.shoulders && measurements?.waist
      ? ((measurements.shoulders as number) / (measurements.waist as number)).toFixed(3)
      : null;

  return (
    <div className="p-6 pb-12 max-w-6xl mx-auto space-y-6">
      <header className="flex items-baseline justify-between mb-2">
        <h1 className="font-serif text-2xl text-text">Dashboard</h1>
        <span className="font-mono text-xs text-text-muted">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </header>

      <HeroStats
        weight={bodyComp?.weight_lbs as number | undefined}
        bodyFat={bodyComp?.body_fat_pct as number | undefined}
        vo2Max={bodyComp?.vo2_max as number | undefined}
        swRatio={swRatio}
        streak={streak}
        totalSessions={allDates.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BodyCompChart history={bodyCompHistory} measurements={measurementHistory} />
          <RecentSessions sessions={recentSessions} />
        </div>
        <div className="space-y-6">
          <ConsistencyCalendar dates={allDates.map((d) => d.date)} />
          <PRBoard prs={prs} />
          <PullUpTimeline />
        </div>
      </div>
    </div>
  );
}
