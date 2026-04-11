import { logSupplementIntake, getSupplementLogForDate, getSupplementLogRange } from "../../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");

  if (date) {
    const log = getSupplementLogForDate(date);
    return Response.json(log);
  }
  if (startDate && endDate) {
    const log = getSupplementLogRange(startDate, endDate);
    return Response.json(log);
  }

  const today = new Date().toISOString().split("T")[0];
  const log = getSupplementLogForDate(today);
  return Response.json(log);
}

export async function POST(request: Request) {
  const body = await request.json();
  logSupplementIntake({
    supplement_id: body.supplement_id,
    date: body.date ?? new Date().toISOString().split("T")[0],
    taken: body.taken ?? 1,
    time_taken: body.time_taken,
    notes: body.notes,
  });
  return Response.json({ ok: true }, { status: 201 });
}
