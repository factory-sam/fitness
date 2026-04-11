import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "../components/ui/nav";

export const metadata: Metadata = {
  title: "FIT — Fitness Tracker",
  description: "Personal fitness dashboard & workout logger",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg">
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
        <div className="status-bar fixed bottom-0 left-0 right-0 z-50">
          <span>FIT v0.1.0</span>
          <span>RECOMP I — Block 1 — Week 1</span>
          <span className="text-gold">●</span>
        </div>
      </body>
    </html>
  );
}
