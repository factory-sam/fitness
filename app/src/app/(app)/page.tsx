import {
  getLatestBodyComp,
  getLatestMeasurements,
  getRecentSessions,
  getSessionDates,
  getWorkoutStreak,
  getPersonalRecords,
  getUntakenSupplementsToday,
  getProgrammeDays,
} from "../../lib/queries";
import { HeroStats } from "../../components/dashboard/hero-stats";
import { InsightCards } from "../../components/dashboard/insight-cards";
import { RecentSessions } from "../../components/dashboard/recent-sessions";
import { ConsistencyCalendar } from "../../components/dashboard/consistency-calendar";
import { PRBoard } from "../../components/dashboard/pr-board";
import { PullUpTimeline } from "../../components/dashboard/pullup-timeline";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const bodyComp = await getLatestBodyComp();
  const measurements = await getLatestMeasurements();
  const recentSessions = await getRecentSessions(5);
  const allDates = await getSessionDates();
  const streak = await getWorkoutStreak();
  const prs = await getPersonalRecords();
  const untakenSupps = await getUntakenSupplementsToday();
  const programmeDays = (await getProgrammeDays()) as { day_name: string; focus: string }[];

  const swRatio =
    measurements?.shoulders && measurements?.waist
      ? (Number(measurements.shoulders) / Number(measurements.waist)).toFixed(3)
      : null;

  const nextWorkoutDay = programmeDays.length > 0 ? programmeDays[0].day_name : undefined;
  const hasSessionData = allDates.length > 0;
  const hasPRs = prs.length > 0;

  return (
    <div className="p-6 pb-12 max-w-5xl mx-auto">
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

      <InsightCards />

      {(hasSessionData || hasPRs) && (
        <>
          <div className="h-px bg-border my-8" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {hasSessionData && <ConsistencyCalendar dates={allDates.map((d) => d.date)} />}
              <RecentSessions sessions={recentSessions} />
            </div>

            <div className="space-y-6">
              {hasPRs && <PRBoard prs={prs} />}
              <PullUpTimeline />
            </div>
          </div>
        </>
      )}

      {!hasSessionData && !hasPRs && (
        <>
          <div className="h-px bg-border my-8" />
          <PullUpTimeline />
        </>
      )}
    </div>
  );
}
