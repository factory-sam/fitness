"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Day {
  id: number;
  day_number: number;
  day_name: string;
  focus: string;
}

type Status = "loading" | "loaded" | "error" | "timeout";

const TIMEOUT_MS = 8000;

export function WorkoutSelector({ onSelect }: { onSelect: (dayNumber: number) => void }) {
  const [days, setDays] = useState<Day[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
      setStatus("timeout");
    }, TIMEOUT_MS);

    fetch("/api/programme", { signal: controller.signal })
      .then((res) => {
        clearTimeout(timer);
        if (!res.ok) {
          setStatus("error");
          return;
        }
        return res.json().then((data: Day[]) => {
          setDays(data);
          setStatus("loaded");
        });
      })
      .catch((err) => {
        clearTimeout(timer);
        if ((err as Error).name === "AbortError") {
          if (!timedOut) return;
        } else {
          setStatus("error");
        }
      });

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [retryCount]);

  const handleRetry = () => {
    setStatus("loading");
    setRetryCount((c) => c + 1);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="type-heading text-text mb-2">Start Workout</h1>
      <p className="font-mono text-xs text-text-muted mb-6">
        Select today&apos;s session from your programme
      </p>

      {status === "loading" && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-10 bg-border rounded" />
                    <div className="h-4 w-32 bg-border rounded" />
                  </div>
                  <div className="h-3 w-48 bg-border rounded" />
                </div>
                <div className="h-5 w-5 bg-border rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {(status === "error" || status === "timeout") && (
        <div className="card text-center py-12 space-y-4">
          <p className="font-mono text-sm text-error">
            {status === "timeout"
              ? "Loading timed out — the server may be slow or unreachable."
              : "Failed to load your programme."}
          </p>
          <button
            onClick={handleRetry}
            className="font-mono text-sm px-4 py-2 rounded border border-gold-dim text-gold hover:bg-gold/10 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {status === "loaded" && days.length === 0 && (
        <div className="card text-center py-12 space-y-4">
          <p className="font-mono text-sm text-text-secondary">No programme configured yet.</p>
          <p className="font-mono text-xs text-text-muted">
            Set one up in Programme to start logging workouts.
          </p>
          <Link
            href="/programme"
            className="inline-block font-mono text-sm px-4 py-2 rounded border border-gold-dim text-gold hover:bg-gold/10 transition-colors"
          >
            Go to Programme →
          </Link>
        </div>
      )}

      {status === "loaded" && days.length > 0 && (
        <div className="space-y-3">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => onSelect(day.day_number)}
              className="card w-full text-left hover:border-gold-dim transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gold-dim shrink-0">
                      Day {day.day_number}
                    </span>
                    <span className="font-mono text-sm text-text font-medium truncate">
                      {day.day_name}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-text-muted truncate">{day.focus}</p>
                </div>
                <span className="text-text-muted group-hover:text-gold transition-colors text-lg shrink-0 ml-2">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
