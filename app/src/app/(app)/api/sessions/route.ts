import { getRecentSessions, createSession, createSet } from "../../../../lib/queries";
import { requireAuth } from "../../../../lib/api-auth";
import log from "../../../../lib/logger";
import { getPostHogClient } from "../../../../lib/posthog-server";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const parsedLimit = parseInt(url.searchParams.get("limit") ?? "10");
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 10;
  const sessions = await getRecentSessions(limit);
  return Response.json(sessions);
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    if (!body.date || typeof body.date !== "string") {
      return Response.json({ error: "Missing required field: date" }, { status: 400 });
    }
    if (!body.name || typeof body.name !== "string") {
      return Response.json({ error: "Missing required field: name" }, { status: 400 });
    }
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

    const posthog = getPostHogClient();
    const distinctId = request.headers.get("x-posthog-distinct-id") ?? "anonymous";
    posthog?.capture({
      distinctId,
      event: "session_created",
      properties: {
        session_id: Number(sessionId),
        name: body.name,
        programme: body.programme,
        sets_logged: setCount,
        date: body.date,
      },
    });
    await posthog?.flush();

    return Response.json({ id: Number(sessionId) }, { status: 201 });
  } catch (err) {
    log.error({ err }, "failed to create session");
    return Response.json({ error: "Failed to create session" }, { status: 500 });
  }
}
