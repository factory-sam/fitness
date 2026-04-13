import { getExerciseHistory, getPersonalRecords } from "../../../../lib/queries";
import { requireAuth } from "../../../../lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const exercise = url.searchParams.get("exercise");
  const prs = url.searchParams.get("prs");

  if (prs === "true") {
    const data = await getPersonalRecords();
    return Response.json(data);
  }

  if (exercise) {
    const parsedLimit = parseInt(url.searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 200) : 50;
    const data = await getExerciseHistory(exercise, limit);
    return Response.json(data);
  }

  return Response.json({ error: "Provide ?exercise= or ?prs=true" }, { status: 400 });
}
