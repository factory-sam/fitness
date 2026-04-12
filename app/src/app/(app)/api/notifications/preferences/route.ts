import {
  getNotificationPreferences,
  upsertNotificationPreferences,
} from "../../../../../lib/queries";
import log from "../../../../../lib/logger";

export async function GET() {
  try {
    const preferences = await getNotificationPreferences();
    return Response.json({ preferences });
  } catch (err) {
    log.error({ err }, "failed to get notification preferences");
    return Response.json({ error: "Failed to get preferences" }, { status: 500 });
  }
}

const ALLOWED_FIELDS = new Set([
  "supplements_enabled",
  "supplements_time",
  "workout_enabled",
  "workout_time",
  "body_comp_enabled",
  "body_comp_day",
  "body_comp_time",
  "quiet_hours_start",
  "quiet_hours_end",
  "timezone",
]);

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        filtered[key] = value;
      }
    }

    if (Object.keys(filtered).length === 0) {
      return Response.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const preferences = await upsertNotificationPreferences(filtered);
    return Response.json({ preferences });
  } catch (err) {
    log.error({ err }, "failed to update notification preferences");
    return Response.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
