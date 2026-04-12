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
  const body = await request.json();
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
  await posthog.shutdown();

  return Response.json({ success: true }, { status: 201 });
}
