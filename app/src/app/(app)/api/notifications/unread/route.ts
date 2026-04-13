import { NextResponse } from "next/server";
import { getUnreadNotificationCount } from "../../../../../lib/queries";
import { requireAuth } from "../../../../../lib/api-auth";
import log from "../../../../../lib/logger";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  try {
    const count = await getUnreadNotificationCount();
    return NextResponse.json({ count });
  } catch (err) {
    log.error({ err }, "failed to get unread notification count");
    return NextResponse.json({ count: 0, error: "Failed to fetch count" }, { status: 500 });
  }
}
