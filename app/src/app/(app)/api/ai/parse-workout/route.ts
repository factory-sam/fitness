import { cookies } from "next/headers";
import { createClient } from "../../../../../utils/supabase/server";
import { oneShot } from "../../../../../lib/ai/droid";
import { PARSE_WORKOUT_PROMPT } from "../../../../../lib/ai/prompts";
import { extractJSON } from "../../../../../lib/ai/extract-json";
import type { ParsedWorkout } from "../../../../../lib/ai/types";
import log from "../../../../../lib/logger";

interface ParseRequest {
  text: string;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ParseRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.text || typeof body.text !== "string") {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const prompt = `${PARSE_WORKOUT_PROMPT}\n\nWorkout to parse:\n${body.text}`;
    const stream = oneShot(prompt);

    let responseText = "";
    for await (const msg of stream) {
      if (msg.type === "assistant_text_delta") {
        responseText += msg.text;
      }
    }

    const parsed = extractJSON<ParsedWorkout>(responseText);

    if (!parsed) {
      log.warn({ responseText }, "Failed to extract ParsedWorkout JSON from response");
      return Response.json({ error: "Failed to parse workout from input" }, { status: 422 });
    }

    if (!parsed.session || !Array.isArray(parsed.sets)) {
      return Response.json({ error: "Invalid workout structure returned" }, { status: 422 });
    }

    return Response.json(parsed);
  } catch (err) {
    log.error({ err }, "Parse workout error");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
