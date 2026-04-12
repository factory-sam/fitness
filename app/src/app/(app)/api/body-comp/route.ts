import { getBodyCompHistory, getLatestBodyComp, createBodyComp } from "../../../../lib/queries";
import { requireAuth } from "../../../../lib/api-auth";
import log from "../../../../lib/logger";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const latest = url.searchParams.get("latest");
  if (latest === "true") {
    const data = await getLatestBodyComp();
    return Response.json(data ?? {});
  }
  const data = await getBodyCompHistory();
  return Response.json(data);
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !body.date) {
      return Response.json({ error: "Missing required field: date" }, { status: 400 });
    }
    if (body.weight_lbs != null && (typeof body.weight_lbs !== "number" || body.weight_lbs <= 0)) {
      return Response.json({ error: "weight_lbs must be a positive number" }, { status: 400 });
    }
    if (
      body.body_fat_pct != null &&
      (typeof body.body_fat_pct !== "number" || body.body_fat_pct < 0 || body.body_fat_pct > 100)
    ) {
      return Response.json({ error: "body_fat_pct must be between 0 and 100" }, { status: 400 });
    }
    await createBodyComp(body);
    log.info({ date: body.date }, "body comp entry created");
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    log.error({ err }, "failed to create body comp entry");
    return Response.json({ error: "Failed to create body comp entry" }, { status: 500 });
  }
}
