import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

interface PushSub {
  id: number;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_token: string;
}

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
  sub: PushSub;
  type: string;
  title: string;
  body: string;
  tag: string;
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

    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidEmail = Deno.env.get("VAPID_EMAIL");
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    if (!vapidPrivate || !vapidEmail || !vapidPublic) {
      return new Response(JSON.stringify({ error: "VAPID not configured" }), { status: 500 });
    }

    webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate);

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth_token");
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }));
    }

    const userSubs = new Map<string, PushSub[]>();
    for (const s of subs as PushSub[]) {
      const arr = userSubs.get(s.user_id) ?? [];
      arr.push(s);
      userSubs.set(s.user_id, arr);
    }

    const userIds = [...userSubs.keys()];
    const { data: allPrefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .in("user_id", userIds);
    const prefsMap = new Map<string, Preferences>();
    for (const p of (allPrefs ?? []) as Preferences[]) {
      prefsMap.set(p.user_id, p);
    }

    const queue: Notification[] = [];

    for (const [userId, subscriptions] of userSubs) {
      const prefs = prefsMap.get(userId);
      if (!prefs) continue;

      const { minutes: currentMin, dayOfWeek } = getCurrentMinutesInTz(prefs.timezone);
      if (isInQuietHours(currentMin, prefs.quiet_hours_start, prefs.quiet_hours_end)) continue;

      const today = todayInTz(prefs.timezone);

      // Supplement reminder
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
          for (const sub of subscriptions) {
            queue.push({
              userId,
              sub,
              type: "supplement",
              title: "Supplement Reminder",
              body: `${untaken.length} supplement${untaken.length > 1 ? "s" : ""} remaining: ${names}`,
              tag: "supplement-reminder",
              url: "/supplements",
            });
          }
        }
      }

      // Workout reminder
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
            for (const sub of subscriptions) {
              queue.push({
                userId,
                sub,
                type: "workout",
                title: "Training Day",
                body: `Today is ${match.focus} — ready to train?`,
                tag: "workout-reminder",
                url: "/workout",
              });
            }
          }
        }
      }

      // Body comp reminder
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
          for (const sub of subscriptions) {
            queue.push({
              userId,
              sub,
              type: "body_comp",
              title: "Weekly Check-in",
              body: "Time to log your weight and measurements",
              tag: "body-comp-reminder",
              url: "/body",
            });
          }
        }
      }
    }

    // Deduplicate: skip if same (user, type) sent within 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const deduped: Notification[] = [];
    const seen = new Set<string>();

    for (const n of queue) {
      const dedupId = `${n.userId}:${n.type}`;
      if (seen.has(dedupId)) {
        deduped.push(n);
        continue;
      }

      const { data: recent } = await supabase
        .from("notification_log")
        .select("id")
        .eq("user_id", n.userId)
        .eq("type", n.type)
        .gte("sent_at", twelveHoursAgo)
        .limit(1);

      if (recent && recent.length > 0) {
        seen.add(dedupId);
        continue;
      }

      seen.add(dedupId);
      deduped.push(n);
    }

    // Send notifications
    let sent = 0;
    const expiredSubIds: number[] = [];
    const loggedTypes = new Set<string>();

    for (const n of deduped) {
      const payload = JSON.stringify({
        title: n.title,
        body: n.body,
        icon: "/vitruvian-man.svg",
        tag: n.tag,
        data: { url: n.url, type: n.type },
      });

      try {
        await webpush.sendNotification(
          { endpoint: n.sub.endpoint, keys: { p256dh: n.sub.p256dh, auth: n.sub.auth_token } },
          payload,
        );
        sent++;

        const logId = `${n.userId}:${n.type}`;
        if (!loggedTypes.has(logId)) {
          loggedTypes.add(logId);
          await supabase.from("notification_log").insert({
            user_id: n.userId,
            type: n.type,
            payload: { title: n.title, body: n.body, url: n.url },
          });
        }
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 401) {
          expiredSubIds.push(n.sub.id);
        }
      }
    }

    if (expiredSubIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", expiredSubIds);
    }

    return new Response(
      JSON.stringify({ sent, expired: expiredSubIds.length, queued: deduped.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-reminders error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
