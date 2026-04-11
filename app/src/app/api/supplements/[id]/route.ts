import { updateSupplement } from "../../../../lib/queries";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  updateSupplement(parseInt(id), body);
  return Response.json({ ok: true });
}
