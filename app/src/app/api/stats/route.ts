import {
  getLatestBodyComp,
  getLatestMeasurements,
  getRecentSessions,
  getSessionDates,
  getWorkoutStreak,
} from "../../../lib/queries";

export async function GET() {
  const bodyComp = getLatestBodyComp() as Record<string, unknown> | undefined;
  const measurements = getLatestMeasurements() as Record<string, unknown> | undefined;
  const recentSessions = getRecentSessions(5);
  const allDates = getSessionDates();
  const streak = getWorkoutStreak();

  const swRatio =
    measurements?.shoulders && measurements?.waist
      ? ((measurements.shoulders as number) / (measurements.waist as number)).toFixed(3)
      : null;

  return Response.json({
    bodyComp: bodyComp ?? {},
    measurements: measurements ?? {},
    swRatio,
    streak,
    totalSessions: allDates.length,
    recentSessions,
  });
}
