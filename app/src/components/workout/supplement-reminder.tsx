"use client";

import { useState, useEffect } from "react";

interface UntakenSupplement {
  id: number;
  name: string;
  amount: number | null;
  units: string | null;
}

export function SupplementReminder() {
  const [untaken, setUntaken] = useState<UntakenSupplement[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const fetchUntaken = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const [suppsRes, logRes] = await Promise.all([
        fetch("/api/supplements"),
        fetch(`/api/supplements/log?date=${today}`),
      ]);
      const supps = await suppsRes.json();
      const log = await logRes.json();
      const takenIds = new Set(
        log.filter((l: { taken: number }) => l.taken === 1).map((l: { supplement_id: number }) => l.supplement_id)
      );
      setUntaken(supps.filter((s: UntakenSupplement) => !takenIds.has(s.id)));
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchUntaken();
  }, []);

  const handleQuickTake = async (id: number) => {
    const today = new Date().toISOString().split("T")[0];
    await fetch("/api/supplements/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplement_id: id,
        date: today,
        taken: 1,
        time_taken: new Date().toTimeString().slice(0, 5),
      }),
    });
    fetchUntaken();
  };

  if (dismissed || untaken.length === 0) return null;

  return (
    <div className="mb-4 border border-gold-dim/40 rounded-md bg-gold-muted/10 px-3 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-xs text-gold">
          {untaken.length} supplement{untaken.length !== 1 ? "s" : ""} remaining today
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="type-micro text-text-muted hover:text-text"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {untaken.map((s) => (
          <button
            key={s.id}
            onClick={() => handleQuickTake(s.id)}
            className="type-micro px-2 py-1 rounded border border-border-subtle bg-bg-elevated/50 text-text-secondary hover:border-gold-dim hover:text-gold transition-colors"
          >
            {s.name}
            {s.amount != null ? ` · ${s.amount}${s.units ?? ""}` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
