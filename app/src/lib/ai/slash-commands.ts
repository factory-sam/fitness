export interface SlashCommand {
  name: string;
  label: string;
  description: string;
  prompt: string;
  icon: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    name: "log",
    label: "/log",
    description: "Log a workout with natural language",
    prompt: "I want to log a workout. Here's what I did: ",
    icon: "\u25B6",
  },
  {
    name: "plan",
    label: "/plan",
    description: "Plan today's training session",
    prompt: "What should I do today? Check my programme and recent sessions.",
    icon: "\u2630",
  },
  {
    name: "analyse",
    label: "/analyse",
    description: "Analyse recent workout performance",
    prompt: "Analyse my most recent workout session.",
    icon: "\u25C9",
  },
];

export function filterCommands(query: string): SlashCommand[] {
  if (!query) return SLASH_COMMANDS;
  const lower = query.toLowerCase();
  return SLASH_COMMANDS.filter(
    (cmd) => cmd.name.startsWith(lower) || cmd.label.startsWith("/" + lower),
  );
}
