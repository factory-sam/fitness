"use client";

import { useEffect, useState } from "react";
import type { AIInsight } from "../../lib/ai/types";

const TYPE_CONFIG: Record<
  AIInsight["type"],
  { icon: string; label: string; defaultColor: string }
> = {
  volume_trend: { icon: "↗", label: "Volume", defaultColor: "text-info" },
  plateau_alert: { icon: "⚠", label: "Plateau", defaultColor: "text-warning" },
  body_comp: { icon: "◉", label: "Body Comp", defaultColor: "text-success" },
  compliance: { icon: "✓", label: "Compliance", defaultColor: "text-gold" },
};

const SEVERITY_COLOR: Record<string, string> = {
  info: "text-info",
  warning: "text-warning",
  success: "text-success",
};

function InsightCard({ insight }: { insight: AIInsight }) {
  const config = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.volume_trend;
  const color = insight.severity
    ? (SEVERITY_COLOR[insight.severity] ?? config.defaultColor)
    : config.defaultColor;
  const isActionable = insight.type === "plateau_alert";

  return (
    <div className={`card relative ${isActionable ? "border-l-2 border-l-gold" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`${color} text-sm`}>{config.icon}</span>
        <span className="type-label text-text-muted">{config.label}</span>
      </div>
      <p className="font-serif text-sm text-text mb-1">{insight.title}</p>
      <p className="type-caption text-text-secondary leading-relaxed">{insight.content}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 rounded bg-bg-elevated" />
        <div className="w-16 h-3 rounded bg-bg-elevated" />
      </div>
      <div className="w-3/4 h-4 rounded bg-bg-elevated mb-2" />
      <div className="w-full h-3 rounded bg-bg-elevated mb-1" />
      <div className="w-2/3 h-3 rounded bg-bg-elevated" />
    </div>
  );
}

export function InsightCards() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [cached, setCached] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  async function fetchInsights() {
    setStatus("loading");
    try {
      const res = await fetch("/api/ai/insights");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: AIInsight[] = data.insights ?? [];
      setInsights(list);
      setCached(data.cached ?? false);
      setUpdatedAt(new Date());
      setStatus(list.length > 0 ? "ready" : "empty");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  if (status === "loading") {
    return (
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="type-label text-text-muted">AI Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="type-label text-text-muted">AI Insights</h2>
        </div>
        <div className="card text-center py-6">
          <p className="type-caption text-text-muted mb-3">Insights unavailable</p>
          <button
            onClick={fetchInsights}
            className="type-micro text-gold hover:text-gold-bright transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="type-label text-text-muted">AI Insights</h2>
        </div>
        <div className="card text-center py-6">
          <p className="type-caption text-text-muted">
            Train for a few sessions to unlock AI insights
          </p>
        </div>
      </section>
    );
  }

  const timeAgo = updatedAt ? formatTimeAgo(updatedAt) : null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="type-label text-text-muted">AI Insights</h2>
        <div className="flex items-center gap-3">
          {timeAgo && (
            <span className="type-micro text-text-muted">
              {cached ? "Cached" : "Updated"} {timeAgo}
            </span>
          )}
          <button
            onClick={fetchInsights}
            className="type-micro text-gold-dim hover:text-gold transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <InsightCard key={`${insight.type}-${i}`} insight={insight} />
        ))}
      </div>
    </section>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
