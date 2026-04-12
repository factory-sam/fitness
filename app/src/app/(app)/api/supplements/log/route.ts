import {
  logSupplementIntake,
  getSupplementLogForDate,
  getSupplementLogRange,
} from "../../../../../lib/queries";

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

  const today = new Date().toISOString().split("T")[0];
  const log = await getSupplementLogForDate(today);
  return Response.json(log.map((l) => ({ ...l, taken: l.taken ? 1 : 0 })));
}

export async function POST(request: Request) {
  const body = await request.json();
  await logSupplementIntake({
    supplement_id: body.supplement_id,
    date: body.date ?? new Date().toISOString().split("T")[0],
    taken: body.taken === 1 || body.taken === true,
    time_taken: body.time_taken,
    notes: body.notes,
  });
  return Response.json({ ok: true }, { status: 201 });
}
