import { getSupplementStreaks, getSupplementComplianceStats } from "../../../../../lib/queries";
import { requireAuth } from "../../../../../lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const parsedDays = parseInt(url.searchParams.get("days") ?? "30");
  const days = Number.isFinite(parsedDays) && parsedDays > 0 ? Math.min(parsedDays, 365) : 30;
  const streaks = await getSupplementStreaks();
  const compliance = await getSupplementComplianceStats(days);
  return Response.json({ streaks, compliance });
}
