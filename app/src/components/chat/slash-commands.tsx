"use client";

import { useEffect, useState, useCallback } from "react";
import { filterCommands, type SlashCommand } from "../../lib/ai/slash-commands";

interface SlashCommandsProps {
  filter: string;
  onSelect: (cmd: SlashCommand) => void;
  onDismiss: () => void;
}

function SlashCommandsInner({
  commands,
  onSelect,
  onDismiss,
}: {
  commands: SlashCommand[];
  onSelect: (cmd: SlashCommand) => void;
  onDismiss: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === "Enter" && commands.length > 0) {
        e.preventDefault();
        onSelect(commands[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    },
    [commands, activeIndex, onSelect, onDismiss],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-bg-elevated border border-border rounded-md shadow-lg overflow-hidden">
      {commands.map((cmd, i) => (
        <button
          key={cmd.name}
          onClick={() => onSelect(cmd)}
          className={`w-full px-3 py-2 text-left flex items-center gap-2.5 transition-colors ${
            i === activeIndex ? "bg-gold-muted/20" : "hover:bg-bg-card"
          }`}
        >
          <span className="text-xs text-text-muted w-4 text-center">{cmd.icon}</span>
          <div className="flex-1 min-w-0">
            <span className="type-micro font-medium text-gold">{cmd.label}</span>
            <span className="type-micro text-text-muted ml-2">{cmd.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function SlashCommands({ filter, onSelect, onDismiss }: SlashCommandsProps) {
  const commands = filterCommands(filter);
  if (commands.length === 0) return null;
  return (
    <SlashCommandsInner
      key={filter}
      commands={commands}
      onSelect={onSelect}
      onDismiss={onDismiss}
    />
  );
}

export function CommandBadge({ commandName }: { commandName: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gold-muted/20 type-micro font-medium text-gold uppercase tracking-wider">
      {commandName}
    </span>
  );
}
