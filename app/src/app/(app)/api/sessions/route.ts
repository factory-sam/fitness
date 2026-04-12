import { getRecentSessions, createSession, createSet } from "../../../../lib/queries";
import log from "../../../../lib/logger";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "10");
  const sessions = await getRecentSessions(limit);
  return Response.json(sessions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = await createSession({
      date: body.date,
      name: body.name,
      programme: body.programme,
      block: body.block,
      week: body.week,
      notes: body.notes,
    });

    const setCount = body.sets?.length ?? 0;
    if (body.sets && Array.isArray(body.sets)) {
      for (const s of body.sets) {
        await createSet({
          session_id: Number(sessionId),
          exercise: s.exercise,
          set_number: s.set_number,
          reps: s.reps,
          weight: s.weight,
          weight_unit: s.weight_unit ?? "lbs",
          rpe: s.rpe,
          duration_sec: s.duration_sec,
          is_calibration: !!s.is_calibration,
          notes: s.notes,
        });
      }
    }

    log.info({ sessionId: Number(sessionId), setCount }, "session created");
    return Response.json({ id: Number(sessionId) }, { status: 201 });
  } catch (err) {
    log.error({ err }, "failed to create session");
    return Response.json({ error: "Failed to create session" }, { status: 500 });
  }
}
