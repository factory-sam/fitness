import { getBodyCompHistory, getLatestBodyComp, createBodyComp } from "../../../../lib/queries";
import log from "../../../../lib/logger";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latest = url.searchParams.get("latest");
  if (latest === "true") {
    const data = await getLatestBodyComp();
    return Response.json(data ?? {});
  }
  const data = await getBodyCompHistory();
  return Response.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await createBodyComp(body);
    log.info({ date: body.date }, "body comp entry created");
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    log.error({ err }, "failed to create body comp entry");
    return Response.json({ error: "Failed to create body comp entry" }, { status: 500 });
  }
}
