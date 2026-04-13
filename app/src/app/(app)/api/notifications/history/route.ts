import { getNotificationHistory } from "../../../../../lib/queries";
import { requireAuth } from "../../../../../lib/api-auth";
import log from "../../../../../lib/logger";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const type = url.searchParams.get("type") ?? undefined;

    let limit = 20;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 100);
      }
    }

    const notifications = await getNotificationHistory(limit, type);
    return Response.json({ notifications });
  } catch (err) {
    log.error({ err }, "failed to get notification history");
    return Response.json({ error: "Failed to get history" }, { status: 500 });
  }
}
