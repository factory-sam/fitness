import { getSession } from "../../../../lib/queries";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/sessions/[id]">
) {
  const { id } = await ctx.params;
  const session = getSession(parseInt(id));
  if (!session) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(session);
}
