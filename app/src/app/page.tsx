import {
  getLatestBodyComp,
  getLatestMeasurements,
  getRecentSessions,
  getSessionDates,
  getWorkoutStreak,
  getPersonalRecords,
  getBodyCompHistory,
  getMeasurements,
  getUntakenSupplementsToday,
  getProgrammeDays,
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
  const untakenSupps = getUntakenSupplementsToday() as unknown[];
  const programmeDays = getProgrammeDays() as { day_name: string; focus: string }[];

  const swRatio =
    measurements?.shoulders && measurements?.waist
      ? ((measurements.shoulders as number) / (measurements.waist as number)).toFixed(3)
      : null;

  // Suggest next workout based on day of week or just first day
  const nextWorkoutDay = programmeDays.length > 0 ? programmeDays[0].day_name : undefined;

  return (
    <div className="p-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-baseline justify-between mb-8">
        <h1 className="type-heading text-text">Dashboard</h1>
        <span className="font-mono text-xs text-text-muted">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </header>

      {/* Hero: Goal progress + today + body metrics */}
      <HeroStats
        weight={bodyComp?.weight_lbs as number | undefined}
        bodyFat={bodyComp?.body_fat_pct as number | undefined}
        vo2Max={bodyComp?.vo2_max as number | undefined}
        swRatio={swRatio}
        streak={streak}
        totalSessions={allDates.length}
        untakenSupplements={untakenSupps.length}
        nextWorkoutDay={nextWorkoutDay}
      />

      {/* Divider */}
      <div className="h-px bg-border my-8" />

      {/* Main content: asymmetric 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Activity — consistency + recent sessions */}
        <div className="lg:col-span-5 space-y-6">
          <ConsistencyCalendar dates={allDates.map((d) => d.date)} />
          <RecentSessions sessions={recentSessions} />
        </div>

        {/* Center: Body trends — the chart */}
        <div className="lg:col-span-4">
          <BodyCompChart history={bodyCompHistory} measurements={measurementHistory} />
        </div>

        {/* Right: Goals — PRs + pull-up progression */}
        <div className="lg:col-span-3 space-y-6">
          <PRBoard prs={prs} />
          <PullUpTimeline />
        </div>
      </div>
    </div>
  );
}
