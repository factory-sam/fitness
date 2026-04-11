import {
  getLatestBodyComp,
  getLatestMeasurements,
  getRecentSessions,
  getSessionDates,
  getWorkoutStreak,
} from "../../../../lib/queries";

export async function GET() {
  const bodyComp = await getLatestBodyComp();
  const measurements = await getLatestMeasurements();
  const recentSessions = await getRecentSessions(5);
  const allDates = await getSessionDates();
  const streak = await getWorkoutStreak();

  const swRatio =
    measurements?.shoulders && measurements?.waist
      ? (Number(measurements.shoulders) / Number(measurements.waist)).toFixed(3)
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
