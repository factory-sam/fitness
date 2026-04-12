import type { Metadata } from "next";
import { Suspense } from "react";
import { PostHogProvider, PostHogPageView } from "../lib/posthog-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitruvian — Fitness Tracker",
  description: "Personal fitness dashboard & workout logger",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg">
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
