"use client";

import { useState } from "react";
import posthog from "posthog-js";

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

const TIME_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "post-workout", label: "Post-Workout" },
  { value: "evening", label: "Evening" },
  { value: "any", label: "Anytime" },
];

const FREQ_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "workout-days", label: "Workout Days" },
  { value: "as-needed", label: "As Needed" },
];

const UNIT_OPTIONS = [
  { value: "g", label: "g" },
  { value: "mg", label: "mg" },
  { value: "mcg", label: "mcg" },
  { value: "ml", label: "ml" },
  { value: "oz", label: "oz" },
  { value: "IU", label: "IU" },
  { value: "caps", label: "caps" },
  { value: "tabs", label: "tabs" },
  { value: "scoops", label: "scoops" },
];

function formatDosage(amount: number | null, units: string | null): string {
  if (amount == null) return "";
  return units ? `${amount}${units}` : `${amount}`;
}

export function ManageStack({
  supplements,
  onAdd,
  onUpdate,
}: {
  supplements: Supplement[];
  onAdd: (data: {
    name: string;
    amount: string;
    units: string;
    time_of_day: string;
    frequency: string;
    notes: string;
  }) => void;
  onUpdate: (id: number, data: Partial<Supplement>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    units: "g",
    time_of_day: "morning",
    frequency: "daily",
    notes: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      amount: "",
      units: "g",
      time_of_day: "morning",
      frequency: "daily",
      notes: "",
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingId !== null) {
      onUpdate(editingId, {
        name: form.name,
        amount: form.amount ? parseFloat(form.amount) : null,
        units: form.units || null,
        time_of_day: form.time_of_day,
        frequency: form.frequency,
        notes: form.notes || null,
      });
      posthog.capture("supplement_updated", {
        supplement_id: editingId,
        supplement_name: form.name,
        time_of_day: form.time_of_day,
        frequency: form.frequency,
      });
    } else {
      onAdd(form);
      posthog.capture("supplement_added", {
        supplement_name: form.name,
        time_of_day: form.time_of_day,
        frequency: form.frequency,
        units: form.units,
      });
    }
    resetForm();
  };

  const startEdit = (supp: Supplement) => {
    setForm({
      name: supp.name,
      amount: supp.amount?.toString() ?? "",
      units: supp.units ?? "g",
      time_of_day: supp.time_of_day,
      frequency: supp.frequency,
      notes: supp.notes ?? "",
    });
    setEditingId(supp.id);
    setShowAddForm(true);
    setExpanded(true);
  };

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="section-heading">Manage Stack</h2>
        <span className="font-mono text-xs text-text-muted">
          {expanded ? "▲" : "▼"} {supplements.length} supplement
          {supplements.length !== 1 ? "s" : ""}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {supplements.map((supp) => (
            <div
              key={supp.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-md border ${
                supp.active
                  ? "border-border-subtle bg-bg-elevated/50"
                  : "border-border-subtle/50 bg-bg/50 opacity-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="font-mono text-sm text-text truncate block">{supp.name}</span>
                {supp.amount != null && (
                  <span className="font-mono text-xs text-text-muted ml-2">
                    {formatDosage(supp.amount, supp.units)}
                  </span>
                )}
                <div className="type-micro text-text-muted mt-0.5">
                  {TIME_OPTIONS.find((t) => t.value === supp.time_of_day)?.label} ·{" "}
                  {FREQ_OPTIONS.find((f) => f.value === supp.frequency)?.label}
                </div>
              </div>
              <button
                onClick={() => startEdit(supp)}
                className="type-micro text-text-muted hover:text-gold transition-colors px-2 py-1"
              >
                EDIT
              </button>
              <button
                onClick={() => {
                  posthog.capture("supplement_updated", {
                    supplement_id: supp.id,
                    supplement_name: supp.name,
                    active: !supp.active,
                  });
                  onUpdate(supp.id, { active: supp.active ? 0 : 1 });
                }}
                className={`type-micro px-2 py-1 transition-colors ${
                  supp.active ? "text-text-muted hover:text-error" : "text-success hover:text-gold"
                }`}
              >
                {supp.active ? "PAUSE" : "RESUME"}
              </button>
            </div>
          ))}

          {showAddForm ? (
            <div className="border border-gold-dim rounded-md p-3 space-y-3 bg-bg-elevated/30">
              <p className="font-mono text-xs text-gold uppercase tracking-widest">
                {editingId !== null ? "Edit Supplement" : "Add Supplement"}
              </p>
              <input
                type="text"
                placeholder="Name (e.g. Creatine Monohydrate)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={80}
                required
                className="w-full bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text placeholder:text-text-muted focus:border-gold-dim focus:outline-none"
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  step="any"
                  min="0"
                  className="bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text placeholder:text-text-muted focus:border-gold-dim focus:outline-none"
                />
                <select
                  value={form.units}
                  onChange={(e) => setForm({ ...form, units: e.target.value })}
                  className="bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text focus:border-gold-dim focus:outline-none"
                >
                  {UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={form.time_of_day}
                  onChange={(e) => setForm({ ...form, time_of_day: e.target.value })}
                  className="bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text focus:border-gold-dim focus:outline-none"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text focus:border-gold-dim focus:outline-none"
                >
                  {FREQ_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-bg-input border border-border rounded-md px-3 py-2 font-mono text-sm text-text placeholder:text-text-muted focus:border-gold-dim focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gold text-bg font-mono text-xs font-semibold py-2 rounded-md hover:bg-gold-bright transition-colors"
                >
                  {editingId !== null ? "SAVE" : "ADD"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 font-mono text-xs text-text-muted hover:text-text py-2 rounded-md border border-border hover:border-gold-dim transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full border border-dashed border-border hover:border-gold-dim rounded-md py-2.5 font-mono text-xs text-text-muted hover:text-gold transition-colors"
            >
              + Add Supplement
            </button>
          )}
        </div>
      )}
    </div>
  );
}
