import { getActiveSupplements, getAllSupplements, createSupplement } from "../../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "true";
  const supplements = all ? await getAllSupplements() : await getActiveSupplements();
  // Map boolean active to number for client compatibility
  return Response.json(supplements.map((s) => ({ ...s, active: s.active ? 1 : 0 })));
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = await createSupplement({
    name: body.name,
    amount: body.amount,
    units: body.units,
    time_of_day: body.time_of_day,
    frequency: body.frequency,
    notes: body.notes,
  });
  return Response.json({ id }, { status: 201 });
}
