import { cookies } from "next/headers";
import { createClient } from "../../../../../../utils/supabase/server";
import { updateAISessionTitle } from "../../../../../../lib/queries";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sessionId = parseInt(id);
  if (isNaN(sessionId)) {
    return Response.json({ error: "Invalid session ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    if (body.title && typeof body.title === "string") {
      await updateAISessionTitle(sessionId, body.title.slice(0, 100));
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update session" }, { status: 500 });
  }
}
