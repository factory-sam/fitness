// MCP tool definitions for the Droid agent.
// Read tools are populated in #16, write tools in #17.

export const READ_TOOLS: Record<string, unknown> = {};
export const WRITE_TOOLS: Record<string, unknown> = {};

export function getAllTools() {
  return { ...READ_TOOLS, ...WRITE_TOOLS };
}
