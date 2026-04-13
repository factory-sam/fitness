import { getSession } from "../../../../../lib/queries";
import { requireAuth } from "../../../../../lib/api-auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ error: "Invalid session ID" }, { status: 400 });
  }
  const session = await getSession(id);
  if (!session) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(session);
}
