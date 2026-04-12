import { updateSupplement } from "../../../../../lib/queries";
import log from "../../../../../lib/logger";

const ALLOWED_FIELDS = new Set([
  "name",
  "amount",
  "units",
  "time_of_day",
  "frequency",
  "active",
  "notes",
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (!Number.isFinite(id) || id <= 0) {
      return Response.json({ error: "Invalid supplement ID" }, { status: 400 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        sanitized[key] = body[key];
      }
    }
    if (Object.keys(sanitized).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }
    await updateSupplement(id, sanitized);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    log.error({ err }, "failed to update supplement");
    return Response.json({ error: "Failed to update supplement" }, { status: 500 });
  }
}
