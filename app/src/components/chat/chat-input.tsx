"use client";

import { useState, useRef, useCallback } from "react";
import { SlashCommands, CommandBadge } from "./slash-commands";
import type { SlashCommand } from "../../lib/ai/slash-commands";

interface ChatInputProps {
  onSend: (text: string) => void;
  onInterrupt: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onInterrupt, isStreaming, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showSlash, setShowSlash] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isStreaming || disabled) return;
    onSend(input);
    setInput("");
    setActiveCommand(null);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [input, isStreaming, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlash) return; // slash commands handle their own keys
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
    const value = e.target.value;
    setInput(value);

    if (value.startsWith("/") && value.length <= 10 && !value.includes(" ")) {
      setShowSlash(true);
      setSlashFilter(value.slice(1));
    } else {
      setShowSlash(false);
    }

    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleCommandSelect = (cmd: SlashCommand) => {
    setInput(cmd.prompt);
    setShowSlash(false);
    setActiveCommand(cmd.name);
    inputRef.current?.focus();
  };

  const handleDismissSlash = () => {
    setShowSlash(false);
  };

  return (
    <div className="border-t border-border p-3">
      {activeCommand && (
        <div className="mb-2">
          <CommandBadge commandName={activeCommand} />
        </div>
      )}
      <div className="relative">
        {showSlash && (
          <SlashCommands
            filter={slashFilter}
            onSelect={handleCommandSelect}
            onDismiss={handleDismissSlash}
          />
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or / for commands..."
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
    </div>
  );
}
