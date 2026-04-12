import { NextResponse } from "next/server";
import { getUnreadNotificationCount } from "../../../../../lib/queries";

export async function GET() {
  try {
    const count = await getUnreadNotificationCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
