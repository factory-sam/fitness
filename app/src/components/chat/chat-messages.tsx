"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../lib/ai/chat-types";

const TOOL_LABELS: Record<string, string> = {
  get_training_history: "Reading training history",
  get_body_comp_trends: "Checking body composition",
  get_programme: "Loading programme",
  get_working_weights: "Checking working weights",
  get_supplement_status: "Checking supplements",
  log_workout: "Logging workout",
  log_body_comp: "Recording body composition",
  update_working_weight: "Updating working weight",
};

function ToolStatus({
  toolCalls,
}: {
  toolCalls: { toolName: string; status: "running" | "complete" }[];
}) {
  const running = toolCalls.filter((tc) => tc.status === "running");
  if (running.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <span className="text-gold-dim animate-pulse">&#10227;</span>
      <span className="type-micro text-gold-dim">
        {TOOL_LABELS[running[0].toolName] ?? running[0].toolName}...
      </span>
    </div>
  );
}

export function ChatMessages({
  messages,
  isStreaming,
}: {
  messages: ChatMessage[];
  isStreaming: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-serif text-lg text-text-secondary">Vitruvian AI</p>
          <p className="type-caption text-text-muted mt-2">
            Ask about your training, log workouts,
            <br />
            or plan your next session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 ${
              msg.role === "user"
                ? "bg-bg-elevated text-text"
                : "border border-border-subtle text-text"
            }`}
          >
            <p className="type-secondary whitespace-pre-wrap break-words">
              {msg.content}
              {msg.role === "assistant" && isStreaming && msg.content.length > 0 && (
                <span className="cursor-blink" />
              )}
            </p>
            {msg.toolCalls && msg.toolCalls.length > 0 && <ToolStatus toolCalls={msg.toolCalls} />}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
