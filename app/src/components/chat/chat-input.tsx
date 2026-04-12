"use client";

import { useState, useRef, useCallback } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onInterrupt: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onInterrupt, isStreaming, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isStreaming || disabled) return;
    onSend(input);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [input, isStreaming, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) {
        onInterrupt();
      } else {
        handleSubmit();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-t border-border p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-bg-input border border-border-subtle rounded-md px-3 py-2 type-secondary text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-gold-dim transition-colors"
          style={{ maxHeight: 120 }}
        />
        {isStreaming ? (
          <button
            onClick={onInterrupt}
            className="shrink-0 px-3 py-2 rounded-md bg-error/20 text-error type-micro font-medium hover:bg-error/30 transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="shrink-0 px-3 py-2 rounded-md bg-gold-muted text-gold type-micro font-medium hover:bg-gold-dim/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
