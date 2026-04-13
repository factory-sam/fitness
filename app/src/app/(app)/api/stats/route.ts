import {
  getLatestBodyComp,
  getLatestMeasurements,
  getRecentSessions,
  getSessionDates,
  getWorkoutStreak,
  getCurrentProgrammeContext,
} from "../../../../lib/queries";
import { requireAuth } from "../../../../lib/api-auth";
import log from "../../../../lib/logger";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  try {
    const [bodyComp, measurements, recentSessions, allDates, streak, programmeContext] =
      await Promise.all([
        getLatestBodyComp(),
        getLatestMeasurements(),
        getRecentSessions(5),
        getSessionDates(),
        getWorkoutStreak(),
        getCurrentProgrammeContext(),
      ]);

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
      programmeContext,
    });
  } catch (err) {
    log.error({ err }, "failed to fetch stats");
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
