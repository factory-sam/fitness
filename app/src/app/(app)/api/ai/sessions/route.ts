import { cookies } from "next/headers";
import { createClient } from "../../../../../utils/supabase/server";
import { getAISessions } from "../../../../../lib/queries";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "20");
  const sessions = await getAISessions(Math.min(limit, 50));
  return Response.json(sessions);
}
