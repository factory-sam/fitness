"use client";

import { useEffect, useState, useCallback } from "react";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { useChat } from "./use-chat";

export function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vitruvian-chat-open") === "true";
  });
  const { messages, isStreaming, error, sendMessage, interrupt, clearChat } = useChat();

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem("vitruvian-chat-open", String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleOpen();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleOpen]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggleOpen} />}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 bottom-[33px] z-40 flex flex-col bg-bg border-l border-border transition-all duration-200 ease-in-out ${
          isOpen ? "w-full md:w-96 opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-gold text-sm">&#9672;</span>
            <span className="font-serif text-sm text-text">Vitruvian AI</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="type-micro text-text-muted hover:text-text px-1.5 py-0.5"
              title="New chat"
            >
              +
            </button>
            <button
              onClick={toggleOpen}
              className="type-micro text-text-muted hover:text-text px-1.5 py-0.5"
              title="Close (Cmd+K)"
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-3 py-2 bg-error/10 border-b border-error/20">
            <p className="type-micro text-error">{error}</p>
          </div>
        )}

        {/* Messages */}
        <ChatMessages messages={messages} isStreaming={isStreaming} />

        {/* Input */}
        <ChatInput onSend={sendMessage} onInterrupt={interrupt} isStreaming={isStreaming} />
      </div>
    </>
  );
}

export function ChatToggle() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vitruvian-chat-open") === "true";
  });

  useEffect(() => {
    function handleStorage() {
      setIsOpen(localStorage.getItem("vitruvian-chat-open") === "true");
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggle = () => {
    const next = !isOpen;
    localStorage.setItem("vitruvian-chat-open", String(next));
    setIsOpen(next);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      onClick={toggle}
      className="text-gold-dim hover:text-gold transition-colors"
      title="Toggle AI Chat (Cmd+K)"
    >
      &#9672; AI {isOpen ? "&#x25BE;" : "&#x25B8;"}
    </button>
  );
}
