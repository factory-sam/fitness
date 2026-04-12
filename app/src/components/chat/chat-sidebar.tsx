"use client";

import { useEffect, useCallback } from "react";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatHistory } from "./chat-history";
import { useChat } from "./use-chat";
import { useChatOpen } from "./chat-provider";

export function ChatSidebar() {
  const enabled = useFeatureFlagEnabled("ai-chat");
  const { isOpen, toggle } = useChatOpen();
  const {
    messages,
    sessionId,
    isStreaming,
    error,
    sendMessage,
    interrupt,
    clearChat,
    setSessionId,
    setMessages,
  } = useChat();

  const handleSelectSession = useCallback(
    (droidSessionId: string) => {
      setMessages([]);
      setSessionId(droidSessionId);
      localStorage.setItem("vitruvian-chat-session", droidSessionId);
    },
    [setMessages, setSessionId],
  );

  useEffect(() => {
    if (!enabled) return;
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, enabled]);

  if (!enabled) return null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggle} />}

      <div
        className={`fixed right-0 top-0 bottom-[33px] z-40 flex flex-col bg-bg border-l border-border transition-all duration-200 ease-in-out ${
          isOpen ? "w-full md:w-96 opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-gold text-sm">&#9672;</span>
            <ChatHistory
              currentSessionId={sessionId}
              onSelectSession={handleSelectSession}
              onNewChat={clearChat}
            />
          </div>
          <button
            onClick={toggle}
            className="type-micro text-text-muted hover:text-text px-1.5 py-0.5"
            title="Close (Cmd+K)"
          >
            &#x2715;
          </button>
        </div>

        {error && (
          <div className="px-3 py-2 bg-error/10 border-b border-error/20">
            <p className="type-micro text-error">{error}</p>
          </div>
        )}

        <ChatMessages messages={messages} isStreaming={isStreaming} />

        <ChatInput onSend={sendMessage} onInterrupt={interrupt} isStreaming={isStreaming} />
      </div>
    </>
  );
}
