import { upsertPushSubscription } from "../../../../../lib/queries";
import log from "../../../../../lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      typeof body.endpoint !== "string" ||
      !body.endpoint.startsWith("https://") ||
      typeof body.keys?.p256dh !== "string" ||
      typeof body.keys?.auth !== "string"
    ) {
      return Response.json({ error: "Invalid subscription object" }, { status: 400 });
    }

    await upsertPushSubscription({
      endpoint: body.endpoint,
      p256dh_key: body.keys.p256dh,
      auth_key: body.keys.auth,
      user_agent: typeof body.userAgent === "string" ? body.userAgent : undefined,
    });

    return Response.json({ success: true });
  } catch (err) {
    log.error({ err }, "failed to subscribe to push");
    return Response.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
