import { markNotificationClicked } from "../../../../../lib/queries";
import log from "../../../../../lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (typeof body.notificationId !== "number" || body.notificationId <= 0) {
      return Response.json({ error: "Invalid notificationId" }, { status: 400 });
    }

    await markNotificationClicked(body.notificationId);
    return Response.json({ success: true });
  } catch (err) {
    log.error({ err }, "failed to mark notification clicked");
    return Response.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
