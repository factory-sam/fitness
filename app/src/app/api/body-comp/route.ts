import { getBodyCompHistory, getLatestBodyComp, createBodyComp } from "../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latest = url.searchParams.get("latest");
  if (latest === "true") {
    const data = getLatestBodyComp();
    return Response.json(data ?? {});
  }
  const data = getBodyCompHistory();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  createBodyComp(body);
  return Response.json({ success: true }, { status: 201 });
}
