"use client";

import { useState, useEffect, useCallback } from "react";
import { getLocalDateString } from "../../../lib/date";
import { TodayStack } from "../../../components/supplements/today-stack";
import { ComplianceChart } from "../../../components/supplements/compliance-chart";
import { ManageStack } from "../../../components/supplements/manage-stack";

interface Supplement {
  id: number;
  name: string;
  amount: number | null;
  units: string | null;
  time_of_day: string;
  frequency: string;
  active: number;
  notes: string | null;
}

interface LogEntry {
  supplement_id: number;
  taken: boolean;
  time_taken: string | null;
}

interface StreakData {
  id: number;
  name: string;
  streak: number;
  longest: number;
}

interface ComplianceData {
  totalActive: number;
  dailyCompliance: { date: string; taken_count: number; compliance: number }[];
}

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [allSupplements, setAllSupplements] = useState<Supplement[]>([]);
  const [todayLog, setTodayLog] = useState<LogEntry[]>([]);
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [compliance, setCompliance] = useState<ComplianceData>({
    totalActive: 0,
    dailyCompliance: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  const today = getLocalDateString();

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [suppsRes, allSuppsRes, logRes, statsRes] = await Promise.all([
        fetch("/api/supplements"),
        fetch("/api/supplements?all=true"),
        fetch(`/api/supplements/log?date=${today}`),
        fetch("/api/supplements/stats?days=90"),
      ]);
      if (!suppsRes.ok || !allSuppsRes.ok || !logRes.ok || !statsRes.ok) {
        throw new Error("Failed to load supplement data");
      }
      setSupplements(await suppsRes.json());
      setAllSupplements(await allSuppsRes.json());
      setTodayLog(await logRes.json());
      const statsData = await statsRes.json();
      setStreaks(statsData.streaks);
      setCompliance(statsData.compliance);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleToggle = async (supplementId: number, taken: boolean) => {
    if (togglingIds.has(supplementId)) return;
    // Optimistic update
    setTogglingIds((prev) => new Set(prev).add(supplementId));
    const prevLog = [...todayLog];
    setTodayLog((prev) => {
      const existing = prev.find((l) => l.supplement_id === supplementId);
      if (existing) {
        return prev.map((l) => (l.supplement_id === supplementId ? { ...l, taken } : l));
      }
      return [...prev, { supplement_id: supplementId, taken, time_taken: null }];
    });
    try {
      const res = await fetch("/api/supplements/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplement_id: supplementId,
          date: today,
          taken,
          time_taken: new Date().toTimeString().slice(0, 5),
        }),
      });
      if (!res.ok) throw new Error("Failed to log");
      fetchAll();
    } catch {
      setTodayLog(prevLog); // Rollback
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(supplementId);
        return next;
      });
    }
  };

  const handleAdd = async (data: {
    name: string;
    amount: string;
    units: string;
    time_of_day: string;
    frequency: string;
    notes: string;
  }) => {
    try {
      const res = await fetch("/api/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount: data.amount ? parseFloat(data.amount) : null,
          units: data.units || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to add supplement");
      fetchAll();
    } catch {
      setError("Failed to add supplement. Try again.");
    }
  };

  const handleUpdate = async (id: number, data: Partial<Supplement>) => {
    try {
      const res = await fetch(`/api/supplements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchAll();
    } catch {
      setError("Failed to update supplement. Try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="type-heading text-text">Supplements</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          Daily supplement tracking & compliance
        </p>
      </header>

      {error && (
        <div className="border border-error/50 rounded-md bg-error/10 px-4 py-3 flex items-center justify-between">
          <span className="type-secondary text-error">{error}</span>
          <button
            onClick={() => {
              setError(null);
              fetchAll();
            }}
            className="type-micro text-text-secondary hover:text-gold transition-colors ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="card py-12 text-center">
          <p className="type-secondary text-text-muted">Loading supplements...</p>
        </div>
      ) : (
        <>
          <TodayStack supplements={supplements} todayLog={todayLog} onToggle={handleToggle} />

          <ComplianceChart streaks={streaks} compliance={compliance} />

          <ManageStack supplements={allSupplements} onAdd={handleAdd} onUpdate={handleUpdate} />
        </>
      )}
    </div>
  );
}
