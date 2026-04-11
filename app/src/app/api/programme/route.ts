import { getDb } from "../../../lib/queries";
import { getDb as getDatabase } from "../../../lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dayNumber = url.searchParams.get("day");
  const db = getDatabase();

  if (dayNumber) {
    const day = db
      .prepare("SELECT * FROM programme_days WHERE day_number = ? ORDER BY id DESC LIMIT 1")
      .get(parseInt(dayNumber));
    if (!day) return Response.json({ error: "Day not found" }, { status: 404 });
    const exercises = db
      .prepare(
        "SELECT * FROM programme_exercises WHERE day_id = ? ORDER BY exercise_order"
      )
      .all((day as Record<string, unknown>).id);
    return Response.json({ ...day, exercises });
  }

  const days = db
    .prepare("SELECT * FROM programme_days ORDER BY day_number")
    .all();
  return Response.json(days);
}
