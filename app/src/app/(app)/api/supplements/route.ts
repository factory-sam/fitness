import { getActiveSupplements, getAllSupplements, createSupplement } from "../../../../lib/queries";
import { requireAuth } from "../../../../lib/api-auth";
import log from "../../../../lib/logger";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "true";
  const supplements = all ? await getAllSupplements() : await getActiveSupplements();
  return Response.json(supplements.map((s) => ({ ...s, active: s.active ? 1 : 0 })));
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim().length === 0
    ) {
      return Response.json({ error: "Missing required field: name" }, { status: 400 });
    }
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
