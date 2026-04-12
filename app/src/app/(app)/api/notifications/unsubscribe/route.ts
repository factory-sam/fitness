import { deletePushSubscription } from "../../../../../lib/queries";
import log from "../../../../../lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (typeof body.endpoint !== "string") {
      return Response.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await deletePushSubscription(body.endpoint);
    return Response.json({ success: true });
  } catch (err) {
    log.error({ err }, "failed to unsubscribe from push");
    return Response.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
