import { getSession } from "../../../../../lib/queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(parseInt(id));
  if (!session) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(session);
}
