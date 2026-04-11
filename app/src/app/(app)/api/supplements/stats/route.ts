import { getSupplementStreaks, getSupplementComplianceStats } from "../../../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") ?? "30");
  const streaks = await getSupplementStreaks();
  const compliance = await getSupplementComplianceStats(days);
  return Response.json({ streaks, compliance });
}
