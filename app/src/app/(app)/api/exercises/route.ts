import { getExerciseHistory, getPersonalRecords } from "../../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exercise = url.searchParams.get("exercise");
  const prs = url.searchParams.get("prs");

  if (prs === "true") {
    const data = await getPersonalRecords();
    return Response.json(data);
  }

  if (exercise) {
    const limit = parseInt(url.searchParams.get("limit") ?? "50");
    const data = await getExerciseHistory(exercise, limit);
    return Response.json(data);
  }

  return Response.json({ error: "Provide ?exercise= or ?prs=true" }, { status: 400 });
}
