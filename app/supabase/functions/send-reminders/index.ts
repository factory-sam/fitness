import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface Preferences {
  user_id: string;
  supplements_enabled: boolean;
  supplements_time: string;
  workout_enabled: boolean;
  workout_time: string;
  body_comp_enabled: boolean;
  body_comp_day: number;
  body_comp_time: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
}

interface Notification {
  userId: string;
  type: string;
  title: string;
  body: string;
  url: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isWithinWindow(current: number, target: number, windowMin = 15): boolean {
  const diff = Math.abs(current - target);
  return diff <= windowMin || diff >= 1440 - windowMin;
}

function isInQuietHours(current: number, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  if (s < e) return current >= s && current < e;
  return current >= s || current < e;
}

function getCurrentMinutesInTz(tz: string): { minutes: number; dayOfWeek: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);

  let hour = 0,
    minute = 0,
    weekday = "";
  for (const p of parts) {
    if (p.type === "hour") hour = parseInt(p.value, 10);
    if (p.type === "minute") minute = parseInt(p.value, 10);
    if (p.type === "weekday") weekday = p.value;
  }

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return { minutes: hour * 60 + minute, dayOfWeek: dayMap[weekday] ?? 0 };
}

function todayInTz(tz: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: allPrefs } = await supabase.from("notification_preferences").select("*");

    if (!allPrefs || allPrefs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }));
    }

    const queue: Notification[] = [];

    for (const prefs of allPrefs as Preferences[]) {
      const userId = prefs.user_id;
      const { minutes: currentMin, dayOfWeek } = getCurrentMinutesInTz(prefs.timezone);
      if (isInQuietHours(currentMin, prefs.quiet_hours_start, prefs.quiet_hours_end)) continue;

      const today = todayInTz(prefs.timezone);

      if (
        prefs.supplements_enabled &&
        isWithinWindow(currentMin, timeToMinutes(prefs.supplements_time))
      ) {
        const { data: active } = await supabase
          .from("supplements")
          .select("id, name")
          .eq("user_id", userId)
          .eq("active", true);
        const { data: logged } = await supabase
          .from("supplement_log")
          .select("supplement_id")
          .eq("user_id", userId)
          .eq("taken_date", today);

        const takenIds = new Set(
          (logged ?? []).map((l: { supplement_id: number }) => l.supplement_id),
        );
        const untaken = (active ?? []).filter((s: { id: number }) => !takenIds.has(s.id));

        if (untaken.length > 0) {
          const names = untaken
            .slice(0, 3)
            .map((s: { name: string }) => s.name)
            .join(", ");
          queue.push({
            userId,
            type: "supplement",
            title: "Supplement Reminder",
            body: `${untaken.length} supplement${untaken.length > 1 ? "s" : ""} remaining: ${names}`,
            url: "/supplements",
          });
        }
      }

      if (prefs.workout_enabled && isWithinWindow(currentMin, timeToMinutes(prefs.workout_time))) {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const todayName = dayNames[dayOfWeek];

        const { data: progDays } = await supabase
          .from("programme_days")
          .select("day_name, focus")
          .eq("user_id", userId);

        const match = (progDays ?? []).find(
          (d: { day_name: string }) => d.day_name.toLowerCase() === todayName.toLowerCase(),
        ) as { day_name: string; focus: string } | undefined;

        if (match) {
          const { data: todaySessions } = await supabase
            .from("sessions")
            .select("id")
            .eq("user_id", userId)
            .eq("date", today)
            .limit(1);

          if (!todaySessions || todaySessions.length === 0) {
            queue.push({
              userId,
              type: "workout",
              title: "Training Day",
              body: `Today is ${match.focus} — ready to train?`,
              url: "/workout",
            });
          }
        }
      }

      if (
        prefs.body_comp_enabled &&
        dayOfWeek === prefs.body_comp_day &&
        isWithinWindow(currentMin, timeToMinutes(prefs.body_comp_time))
      ) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: recent } = await supabase
          .from("body_comp")
          .select("id")
          .eq("user_id", userId)
          .gte("date", weekAgo.toISOString().split("T")[0])
          .limit(1);

        if (!recent || recent.length === 0) {
          queue.push({
            userId,
            type: "body_comp",
            title: "Weekly Check-in",
            body: "Time to log your weight and measurements",
            url: "/body",
          });
        }
      }
    }

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const deduped: Notification[] = [];
    const seen = new Set<string>();

    for (const n of queue) {
      const dedupId = `${n.userId}:${n.type}`;
      if (seen.has(dedupId)) continue;

      const { data: recent } = await supabase
        .from("notification_log")
        .select("id")
        .eq("user_id", n.userId)
        .eq("type", n.type)
        .gte("sent_at", twelveHoursAgo)
        .limit(1);

      seen.add(dedupId);
      if (!recent || recent.length === 0) {
        deduped.push(n);
      }
    }

    let sent = 0;
    for (const n of deduped) {
      await supabase.from("notification_log").insert({
        user_id: n.userId,
        type: n.type,
        payload: { title: n.title, body: n.body, url: n.url },
      });
      sent++;
    }

    return new Response(JSON.stringify({ sent, queued: queue.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-reminders error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
