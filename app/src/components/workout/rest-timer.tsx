"use client";

import { useState, useEffect, useRef } from "react";

export function RestTimer({
  seconds,
  onComplete,
}: {
  seconds: number;
  onComplete: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds, onComplete]);

  const progress = remaining / seconds;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - progress);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#1e1e1e"
          strokeWidth="4"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          className="timer-ring"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="font-mono text-2xl text-gold font-semibold">
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
      <button
        onClick={() => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
        }}
        className="font-mono text-xs text-text-muted hover:text-gold transition-colors"
      >
        Skip →
      </button>
    </div>
  );
}

export function StopwatchTimer({ onStop }: { onStop: (seconds: number) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <span className="font-mono text-3xl text-gold font-semibold">
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
      <button
        onClick={() => {
          setRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          onStop(elapsed);
        }}
        className="font-mono text-sm px-4 py-2 bg-gold text-bg rounded hover:bg-gold-bright transition-colors"
      >
        Stop & Log
      </button>
    </div>
  );
}
