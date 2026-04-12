import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
import { requireAuth } from "../../../../lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const dayNumber = url.searchParams.get("day");
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (dayNumber) {
    const { data: day } = await supabase
      .from("programme_days")
      .select("*")
      .eq("day_number", parseInt(dayNumber))
      .order("id", { ascending: false })
      .limit(1)
      .single();
    if (!day) return Response.json({ error: "Day not found" }, { status: 404 });
    const { data: exercises } = await supabase
      .from("programme_exercises")
      .select("*")
      .eq("day_id", day.id)
      .order("exercise_order");
    return Response.json({
      ...day,
      exercises: (exercises ?? []).map((e) => ({
        ...e,
        is_warmup: e.is_warmup ? 1 : 0,
      })),
    });
  }

  const { data: days } = await supabase.from("programme_days").select("*").order("day_number");
  return Response.json(days ?? []);
}
