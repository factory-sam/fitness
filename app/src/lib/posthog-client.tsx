"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";

export function PostHogProvider({ children }: { children: ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function PostHogPageView() {
  const ph = usePostHog();

  useEffect(() => {
    if (!ph) return;
    ph.capture("$pageview", {
      $current_url: window.location.href,
      $pathname: window.location.pathname,
    });
  }, [ph]);

  return null;
}
