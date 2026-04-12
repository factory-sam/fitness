"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getLocalDateString } from "../../lib/date";

const FIELDS = [
  { key: "shoulders", label: "Shoulders", placeholder: '52.0"' },
  { key: "chest", label: "Chest", placeholder: '42.0"' },
  { key: "upper_arm_r", label: "Arm (R)", placeholder: '15.0"' },
  { key: "waist", label: "Waist", placeholder: '33.0"' },
  { key: "hips", label: "Hips", placeholder: '38.0"' },
] as const;

type FormData = {
  date: string;
  shoulders: string;
  chest: string;
  upper_arm_r: string;
  waist: string;
  hips: string;
};

export function LogMeasurements() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    date: getLocalDateString(),
    shoulders: "",
    chest: "",
    upper_arm_r: "",
    waist: "",
    hips: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasValue = FIELDS.some((f) => form[f.key] !== "");
    if (!hasValue) {
      setError("Enter at least one measurement");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { date: form.date };
      for (const f of FIELDS) {
        if (form[f.key]) payload[f.key] = parseFloat(form[f.key]);
      }
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      setOpen(false);
      setForm({
        date: getLocalDateString(),
        shoulders: "",
        chest: "",
        upper_arm_r: "",
        waist: "",
        hips: "",
      });
      router.refresh();
    } catch {
      setError("Failed to save measurements. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="font-mono text-xs text-gold hover:text-gold-bright transition-colors"
      >
        + Log Measurements
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gold-dim rounded-md p-3 space-y-3 bg-bg-elevated/30 mt-3"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-gold uppercase tracking-widest">Log Measurements</p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="font-mono text-xs text-text-muted hover:text-text transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && <p className="font-mono text-xs text-error">{error}</p>}

      <div>
        <label className="type-label block mb-1">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="w-full bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text focus:border-gold-dim focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="type-label block mb-1">{f.label} (in)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text placeholder:text-text-muted focus:border-gold-dim focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold text-bg font-mono text-xs font-semibold py-2 rounded-md hover:bg-gold-bright transition-colors disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save Measurements"}
      </button>
    </form>
  );
}
