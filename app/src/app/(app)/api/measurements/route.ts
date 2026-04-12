import { getMeasurements, getLatestMeasurements, createMeasurement } from "../../../../lib/queries";
import { getPostHogClient } from "../../../../lib/posthog-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latest = url.searchParams.get("latest");
  if (latest === "true") {
    const data = await getLatestMeasurements();
    return Response.json(data ?? {});
  }
  const data = await getMeasurements();
  return Response.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !body.date) {
      return Response.json({ error: "Missing required field: date" }, { status: 400 });
    }
    await createMeasurement(body);

    const posthog = getPostHogClient();
    const distinctId = request.headers.get("x-posthog-distinct-id") ?? "anonymous";
    posthog.capture({
      distinctId,
      event: "measurement_recorded",
      properties: {
        date: body.date,
        has_weight: body.weight_lbs != null,
        has_body_fat: body.body_fat_pct != null,
      },
    });
    await posthog.flush();

    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return Response.json({ error: "Failed to create measurement" }, { status: 500 });
  }
}
