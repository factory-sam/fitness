import { cookies } from "next/headers";
import { createClient } from "../../../../../utils/supabase/server";
import { oneShot } from "../../../../../lib/ai/droid";
import { getCachedInsights, cacheInsights } from "../../../../../lib/queries";
import { INSIGHT_SYSTEM_PROMPT } from "../../../../../lib/ai/prompts";
import type { AIInsight } from "../../../../../lib/ai/types";
import log from "../../../../../lib/logger";

function isValidInsight(obj: unknown): obj is AIInsight {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return typeof o.type === "string" && typeof o.title === "string" && typeof o.content === "string";
}

function parseInsightsFromText(text: string): AIInsight[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidInsight);
  } catch {
    return [];
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cached = await getCachedInsights();
    if (cached.length > 0) {
      const insights: AIInsight[] = cached.map((row) => {
        const content = row.content as Record<string, unknown>;
        return {
          type: (content.type ?? row.type) as AIInsight["type"],
          title: (content.title as string) ?? "",
          content: (content.content as string) ?? "",
          severity: content.severity as AIInsight["severity"],
        };
      });
      return Response.json({ insights, cached: true });
    }

    const droidQuery = oneShot(INSIGHT_SYSTEM_PROMPT);
    let fullText = "";
    for await (const msg of droidQuery) {
      if (msg.type === "assistant_text_delta") {
        fullText += msg.text;
      }
    }

    const insights = parseInsightsFromText(fullText);

    if (insights.length > 0) {
      await cacheInsights(
        insights.map((i) => ({
          type: i.type,
          content: {
            type: i.type,
            title: i.title,
            content: i.content,
            severity: i.severity,
          },
        })),
      );
    }

    return Response.json({ insights, cached: false });
  } catch (err) {
    log.error({ err }, "Failed to generate insights");
    return Response.json(
      { insights: [], cached: false, error: "Failed to generate insights" },
      { status: 200 },
    );
  }
}
