import { getActiveSupplements, getAllSupplements, createSupplement } from "../../../../lib/queries";
import log from "../../../../lib/logger";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "true";
  const supplements = all ? await getAllSupplements() : await getActiveSupplements();
  return Response.json(supplements.map((s) => ({ ...s, active: s.active ? 1 : 0 })));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await createSupplement({
      name: body.name,
      amount: body.amount,
      units: body.units,
      time_of_day: body.time_of_day,
      frequency: body.frequency,
      notes: body.notes,
    });
    log.info({ supplementId: id, name: body.name }, "supplement created");
    return Response.json({ id }, { status: 201 });
  } catch (err) {
    log.error({ err }, "failed to create supplement");
    return Response.json({ error: "Failed to create supplement" }, { status: 500 });
  }
}
