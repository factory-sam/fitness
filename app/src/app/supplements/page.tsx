"use client";

import { useState, useEffect, useCallback } from "react";
import { TodayStack } from "../../components/supplements/today-stack";
import { ComplianceChart } from "../../components/supplements/compliance-chart";
import { ManageStack } from "../../components/supplements/manage-stack";

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
  taken: number;
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

  const today = new Date().toISOString().split("T")[0];

  const fetchAll = useCallback(async () => {
    const [suppsRes, allSuppsRes, logRes, statsRes] = await Promise.all([
      fetch("/api/supplements"),
      fetch("/api/supplements?all=true"),
      fetch(`/api/supplements/log?date=${today}`),
      fetch("/api/supplements/stats?days=90"),
    ]);
    setSupplements(await suppsRes.json());
    setAllSupplements(await allSuppsRes.json());
    setTodayLog(await logRes.json());
    const statsData = await statsRes.json();
    setStreaks(statsData.streaks);
    setCompliance(statsData.compliance);
  }, [today]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleToggle = async (supplementId: number, taken: boolean) => {
    await fetch("/api/supplements/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplement_id: supplementId,
        date: today,
        taken: taken ? 1 : 0,
        time_taken: new Date().toTimeString().slice(0, 5),
      }),
    });
    fetchAll();
  };

  const handleAdd = async (data: {
    name: string;
    amount: string;
    units: string;
    time_of_day: string;
    frequency: string;
    notes: string;
  }) => {
    await fetch("/api/supplements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        amount: data.amount ? parseFloat(data.amount) : null,
        units: data.units || null,
      }),
    });
    fetchAll();
  };

  const handleUpdate = async (id: number, data: Partial<Supplement>) => {
    await fetch(`/api/supplements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchAll();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
      <header>
        <h1 className="type-heading text-text">Supplements</h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          Daily supplement tracking & compliance
        </p>
      </header>

      <TodayStack
        supplements={supplements}
        todayLog={todayLog}
        onToggle={handleToggle}
      />

      <ComplianceChart streaks={streaks} compliance={compliance} />

      <ManageStack
        supplements={allSupplements}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
