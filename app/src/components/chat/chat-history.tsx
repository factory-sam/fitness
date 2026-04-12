"use client";

import { useState, useEffect, useRef } from "react";

interface AISession {
  id: number;
  droid_session_id: string;
  title: string | null;
  last_active_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function ChatHistory({
  currentSessionId,
  onSelectSession,
  onNewChat,
}: {
  currentSessionId: string | null;
  onSelectSession: (droidSessionId: string) => void;
  onNewChat: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<AISession[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/ai/sessions?limit=10")
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen]);

  const currentSession = sessions.find((s) => s.droid_session_id === currentSessionId);
  const displayTitle = currentSession?.title ?? "New Chat";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-1.5 type-micro text-text-secondary hover:text-text transition-colors"
      >
        <span className="truncate max-w-[180px]">{displayTitle}</span>
        <span className="text-[10px]">{isOpen ? "\u25B4" : "\u25BE"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-bg-elevated border border-border rounded-md shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => {
              onNewChat();
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left type-micro text-gold hover:bg-gold-muted/20 transition-colors"
          >
            + New Chat
          </button>
          {sessions.length > 0 && (
            <div className="border-t border-border-subtle">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s.droid_session_id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between type-micro transition-colors ${
                    s.droid_session_id === currentSessionId
                      ? "text-gold bg-gold-muted/10"
                      : "text-text-secondary hover:text-text hover:bg-bg-card"
                  }`}
                >
                  <span className="truncate">{s.title ?? "Untitled"}</span>
                  <span className="text-text-muted shrink-0 ml-2">{timeAgo(s.last_active_at)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
