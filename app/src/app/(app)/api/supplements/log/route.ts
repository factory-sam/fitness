import {
  logSupplementIntake,
  getSupplementLogForDate,
  getSupplementLogRange,
} from "../../../../../lib/queries";
import { getLocalDateString } from "../../../../../lib/date";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");

  if (date) {
    const log = await getSupplementLogForDate(date);
    // Map boolean taken to number for client compatibility
    return Response.json(log.map((l) => ({ ...l, taken: l.taken ? 1 : 0 })));
  }
  if (startDate && endDate) {
    const log = await getSupplementLogRange(startDate, endDate);
    return Response.json(log.map((l) => ({ ...l, taken: l.taken ? 1 : 0 })));
  }

  const today = getLocalDateString();
  const log = await getSupplementLogForDate(today);
  return Response.json(log.map((l) => ({ ...l, taken: l.taken ? 1 : 0 })));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !body.supplement_id) {
      return Response.json({ error: "Missing required field: supplement_id" }, { status: 400 });
    }
    await logSupplementIntake({
      supplement_id: body.supplement_id,
      date: body.date ?? getLocalDateString(),
      taken: body.taken === 1 || body.taken === true,
      time_taken: body.time_taken,
      notes: body.notes,
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return Response.json({ error: "Failed to log supplement intake" }, { status: 500 });
  }
}
