"use client";

import { useState, useRef, useCallback } from "react";
import type { ChatMessage, SSEEvent } from "../../lib/ai/chat-types";
import posthog from "posthog-js";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function parseSSELine(line: string): SSEEvent | null {
  if (!line.startsWith("data: ")) return null;
  try {
    return JSON.parse(line.slice(6)) as SSEEvent;
  } catch {
    return null;
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("vitruvian-chat-session");
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hasAutoTitled = useRef(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        toolCalls: [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(true);
      posthog.capture("ai_chat_message_sent", {
        session_id: sessionId,
        message_length: text.trim().length,
      });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), sessionId }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const event = parseSSELine(line.trim());
            if (!event) continue;

            switch (event.type) {
              case "session_info": {
                const newSessionId = event.sessionId;
                setSessionId(newSessionId);
                if (typeof window !== "undefined") {
                  localStorage.setItem("vitruvian-chat-session", newSessionId);
                }
                break;
              }
              case "text_delta":
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: m.content + event.text } : m,
                  ),
                );
                break;
              case "tool_use":
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? {
                          ...m,
                          toolCalls: [
                            ...(m.toolCalls ?? []),
                            { toolName: event.toolName, status: "running" as const },
                          ],
                        }
                      : m,
                  ),
                );
                break;
              case "tool_result":
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? {
                          ...m,
                          toolCalls: (m.toolCalls ?? []).map((tc) =>
                            tc.toolName === event.toolName
                              ? { ...tc, status: "complete" as const }
                              : tc,
                          ),
                        }
                      : m,
                  ),
                );
                break;
              case "turn_complete":
                setIsStreaming(false);
                if (!hasAutoTitled.current && userMsg.content) {
                  hasAutoTitled.current = true;
                  const title = userMsg.content.slice(0, 50);
                  fetch("/api/ai/sessions", { method: "GET" })
                    .then((r) => r.json())
                    .then((sessions: { id: number; droid_session_id: string }[]) => {
                      const match = sessions.find(
                        (s: { droid_session_id: string }) => s.droid_session_id === event.sessionId,
                      );
                      if (match) {
                        fetch(`/api/ai/sessions/${match.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ title }),
                        }).catch(() => {});
                      }
                    })
                    .catch(() => {});
                }
                break;
              case "error":
                setError(event.message);
                setIsStreaming(false);
                break;
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const message = err instanceof Error ? err.message : "Connection failed";
          setError(message);
          posthog.capture("ai_chat_error", { session_id: sessionId, error_message: message });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, sessionId],
  );

  const interrupt = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    hasAutoTitled.current = false;
    if (typeof window !== "undefined") {
      localStorage.removeItem("vitruvian-chat-session");
    }
  }, []);

  return {
    messages,
    sessionId,
    isStreaming,
    error,
    sendMessage,
    interrupt,
    clearChat,
    setSessionId,
    setMessages,
  };
}
