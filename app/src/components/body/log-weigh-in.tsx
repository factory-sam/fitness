"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getLocalDateString } from "../../lib/date";

export function LogWeighIn() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: getLocalDateString(),
    weight_lbs: "",
    body_fat_pct: "",
    vo2_max: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weight_lbs && !form.body_fat_pct && !form.vo2_max) {
      setError("Enter at least one measurement");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/body-comp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          weight_lbs: form.weight_lbs ? parseFloat(form.weight_lbs) : undefined,
          body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : undefined,
          vo2_max: form.vo2_max ? parseFloat(form.vo2_max) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setOpen(false);
      setForm({ date: getLocalDateString(), weight_lbs: "", body_fat_pct: "", vo2_max: "" });
      router.refresh();
    } catch {
      setError("Failed to save weigh-in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold text-bg font-mono text-xs font-semibold rounded-md hover:bg-gold-bright transition-colors"
      >
        Log Weigh-In
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card border-gold-dim space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-gold uppercase tracking-widest">Log Weigh-In</p>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <div>
          <label className="type-label block mb-1">Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="185.0"
            value={form.weight_lbs}
            onChange={(e) => setForm({ ...form, weight_lbs: e.target.value })}
            className="w-full bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text placeholder:text-text-muted focus:border-gold-dim focus:outline-none"
          />
        </div>
        <div>
          <label className="type-label block mb-1">Body Fat %</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="60"
            placeholder="18.0"
            value={form.body_fat_pct}
            onChange={(e) => setForm({ ...form, body_fat_pct: e.target.value })}
            className="w-full bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text placeholder:text-text-muted focus:border-gold-dim focus:outline-none"
          />
        </div>
        <div>
          <label className="type-label block mb-1">VO₂ Max</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="42.0"
            value={form.vo2_max}
            onChange={(e) => setForm({ ...form, vo2_max: e.target.value })}
            className="w-full bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text placeholder:text-text-muted focus:border-gold-dim focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold text-bg font-mono text-xs font-semibold py-2 rounded-md hover:bg-gold-bright transition-colors disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save Weigh-In"}
      </button>
    </form>
  );
}
