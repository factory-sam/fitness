import { cookies } from "next/headers";
import { createClient } from "../../../../../utils/supabase/server";
import { createAISession, resumeAISession } from "../../../../../lib/ai/droid";
import {
  createAISessionRecord,
  touchAISession,
  getAISessionByDroidId,
} from "../../../../../lib/queries";
import log from "../../../../../lib/logger";

interface ChatRequest {
  message: string;
  sessionId?: string;
}

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
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

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string") {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let droidSessionId = body.sessionId;
        let session;

        if (droidSessionId) {
          try {
            session = await resumeAISession(droidSessionId);
            const dbSession = await getAISessionByDroidId(droidSessionId);
            if (dbSession) {
              await touchAISession(dbSession.id);
            }
          } catch {
            log.warn({ droidSessionId }, "Failed to resume session, creating new one");
            droidSessionId = undefined;
          }
        }

        if (!session) {
          session = await createAISession();
          droidSessionId = session.sessionId;
          if (droidSessionId) {
            await createAISessionRecord(droidSessionId);
          }
        }

        controller.enqueue(
          encoder.encode(sseEvent({ type: "session_info", sessionId: droidSessionId })),
        );

        const droidStream = session.stream(body.message);
        for await (const msg of droidStream) {
          switch (msg.type) {
            case "assistant_text_delta":
              controller.enqueue(encoder.encode(sseEvent({ type: "text_delta", text: msg.text })));
              break;
            case "tool_use":
              controller.enqueue(
                encoder.encode(
                  sseEvent({
                    type: "tool_use",
                    toolName: "toolName" in msg ? msg.toolName : undefined,
                  }),
                ),
              );
              break;
            case "tool_result":
              controller.enqueue(
                encoder.encode(
                  sseEvent({
                    type: "tool_result",
                    toolName: "toolName" in msg ? msg.toolName : undefined,
                  }),
                ),
              );
              break;
            case "turn_complete":
              controller.enqueue(
                encoder.encode(sseEvent({ type: "turn_complete", sessionId: droidSessionId })),
              );
              break;
            case "error":
              controller.enqueue(
                encoder.encode(
                  sseEvent({
                    type: "error",
                    message: "message" in msg ? msg.message : "Unknown error",
                  }),
                ),
              );
              break;
          }
        }
      } catch (err) {
        log.error({ err }, "Chat stream error");
        controller.enqueue(
          encoder.encode(
            sseEvent({
              type: "error",
              message: err instanceof Error ? err.message : "Internal server error",
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
