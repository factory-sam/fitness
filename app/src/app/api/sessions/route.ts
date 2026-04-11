import { getRecentSessions, createSession, createSet } from "../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "10");
  const sessions = getRecentSessions(limit);
  return Response.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const sessionId = createSession({
    date: body.date,
    name: body.name,
    programme: body.programme,
    block: body.block,
    week: body.week,
    notes: body.notes,
  });

  if (body.sets && Array.isArray(body.sets)) {
    for (const s of body.sets) {
      createSet({
        session_id: Number(sessionId),
        exercise: s.exercise,
        set_number: s.set_number,
        reps: s.reps,
        weight: s.weight,
        weight_unit: s.weight_unit ?? "lbs",
        rpe: s.rpe,
        duration_sec: s.duration_sec,
        is_calibration: s.is_calibration ?? 0,
        notes: s.notes,
      });
    }
  }

  return Response.json({ id: Number(sessionId) }, { status: 201 });
}
