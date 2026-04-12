export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  toolCalls?: { toolName: string; status: "running" | "complete" }[];
}

export type SSEEvent =
  | { type: "session_info"; sessionId: string }
  | { type: "text_delta"; text: string }
  | { type: "tool_use"; toolName: string }
  | { type: "tool_result"; toolName: string }
  | { type: "turn_complete"; sessionId: string }
  | { type: "error"; message: string };
