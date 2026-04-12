import { createSession, resumeSession, query, ToolConfirmationOutcome } from "@factory/droid-sdk";
import type { DroidSession, DroidQuery } from "@factory/droid-sdk";

const DEFAULT_CWD = process.cwd();

interface SessionOptions {
  cwd?: string;
  modelId?: string;
}

export async function createAISession(options: SessionOptions = {}): Promise<DroidSession> {
  return createSession({
    cwd: options.cwd ?? DEFAULT_CWD,
    modelId: options.modelId,
    permissionHandler: () => ToolConfirmationOutcome.ProceedOnce,
  });
}

export async function resumeAISession(
  sessionId: string,
  options: SessionOptions = {},
): Promise<DroidSession> {
  return resumeSession(sessionId, {
    cwd: options.cwd ?? DEFAULT_CWD,
    permissionHandler: () => ToolConfirmationOutcome.ProceedOnce,
  });
}

export function oneShot(prompt: string, cwd?: string): DroidQuery {
  return query({
    prompt,
    cwd: cwd ?? DEFAULT_CWD,
    permissionHandler: () => ToolConfirmationOutcome.ProceedOnce,
  });
}
