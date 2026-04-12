"use client";

import { useFeatureFlagEnabled } from "posthog-js/react";
import { useChatOpen } from "../chat/chat-provider";

export function StatusBar() {
  const aiChatEnabled = useFeatureFlagEnabled("ai-chat");
  const { isOpen, toggle } = useChatOpen();

  return (
    <div className="status-bar fixed bottom-0 left-0 right-0 z-50">
      <span>VITRUVIAN v0.2.0</span>
      <span>RECOMP I — Block 1 — Week 1</span>
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
