import { getPostHogClient } from "./posthog-server";

/**
 * Centralised feature flag registry.
 * All flags used in the app are defined here so agents and developers can
 * discover, add, and deprecate flags in one place.
 *
 * PostHog evaluates flags remotely — flag definitions (rollout %, variants,
 * targeting) are managed in the PostHog dashboard, not in code.
 */
export const FLAGS = {
  /** AI chat sidebar — gates the Cmd+K chat experience */
  AI_CHAT: "ai-chat",
  /** Experimental dashboard widgets (insight cards, charts) */
  NEW_DASHBOARD: "new-dashboard",
} as const;

export type FlagKey = (typeof FLAGS)[keyof typeof FLAGS];

/**
 * Evaluate a feature flag server-side for a given user.
 *
 * Use this in API routes and Server Components to gate behaviour behind
 * PostHog feature flags with the same targeting rules as the client.
 *
 * @example
 * const enabled = await isFeatureEnabled(FLAGS.AI_CHAT, userId);
 */
export async function isFeatureEnabled(flag: FlagKey, distinctId: string): Promise<boolean> {
  const posthog = getPostHogClient();
  return posthog.isFeatureEnabled(flag, distinctId) ?? false;
}

/**
 * Get a multivariate flag value server-side.
 *
 * Returns the variant key string, or undefined when the flag is off.
 */
export async function getFeatureFlagPayload(
  flag: FlagKey,
  distinctId: string,
): Promise<string | boolean | undefined> {
  const posthog = getPostHogClient();
  return posthog.getFeatureFlag(flag, distinctId) ?? undefined;
}
