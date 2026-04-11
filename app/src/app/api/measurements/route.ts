import { getMeasurements, getLatestMeasurements, createMeasurement } from "../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latest = url.searchParams.get("latest");
  if (latest === "true") {
    const data = getLatestMeasurements();
    return Response.json(data ?? {});
  }
  const data = getMeasurements();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  createMeasurement(body);
  return Response.json({ success: true }, { status: 201 });
}
