import { getActiveSupplements, getAllSupplements, createSupplement } from "../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "true";
  const supplements = all ? getAllSupplements() : getActiveSupplements();
  return Response.json(supplements);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createSupplement({
    name: body.name,
    dosage: body.dosage,
    time_of_day: body.time_of_day,
    frequency: body.frequency,
    notes: body.notes,
  });
  return Response.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}
