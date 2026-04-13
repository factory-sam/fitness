"use client";

import { useEffect, useState } from "react";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useChatOpen } from "../chat/chat-provider";

export function StatusBar() {
  const aiChatEnabled = useFeatureFlagEnabled("ai-chat");
  const { isOpen, toggle } = useChatOpen();
  const [context, setContext] = useState<string>("Loading…");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        const parts: string[] = [];
        if (d.programmeContext?.programme) parts.push(d.programmeContext.programme);
        if (d.programmeContext?.block) parts.push(d.programmeContext.block);
        if (d.programmeContext?.week != null) parts.push(`Week ${d.programmeContext.week}`);
        setContext(parts.length > 0 ? parts.join(" — ") : "No programme set");
      })
      .catch(() => setContext("—"));
  }, []);

  return (
    <div className="status-bar fixed bottom-0 left-0 right-0 z-50">
      <span>VITRUVIAN v0.2.0</span>
      <span>{context}</span>
      {aiChatEnabled && (
        <button
          onClick={toggle}
          className={`transition-colors ${isOpen ? "text-gold" : "text-gold-dim hover:text-gold"}`}
          title="Toggle AI Chat (Cmd+K)"
        >
          &#9672; AI
        </button>
      )}
    </div>
  );
}
