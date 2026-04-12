"use client";

import { useCallback, useEffect, useState } from "react";

interface Preferences {
  supplements_enabled: boolean;
  supplements_time: string;
  workout_enabled: boolean;
  workout_time: string;
  body_comp_enabled: boolean;
  body_comp_day: number;
  body_comp_time: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
}

interface NotificationEntry {
  id: number;
  type: string;
  payload: { title: string; body: string; url: string };
  sent_at: string;
  clicked: boolean;
}

const DEFAULTS: Preferences = {
  supplements_enabled: true,
  supplements_time: "08:00",
  workout_enabled: true,
  workout_time: "10:00",
  body_comp_enabled: true,
  body_comp_day: 0,
  body_comp_time: "08:00",
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<NotificationEntry[]>([]);

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((r) => r.json())
      .then((d) => {
        if (d.preferences) setPrefs({ ...DEFAULTS, ...d.preferences });
      })
      .catch(() => {});

    fetch("/api/notifications/history?limit=20")
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => {});
  }, []);

  const save = useCallback(
    async (patch: Partial<Preferences>) => {
      const next = { ...prefs, ...patch };
      setPrefs(next);
      setSaving(true);
      try {
        await fetch("/api/notifications/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } finally {
        setSaving(false);
      }
    },
    [prefs],
  );

  async function handleClick(entry: NotificationEntry) {
    if (!entry.clicked) {
      await fetch("/api/notifications/clicked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id }),
      });
      setHistory((h) => h.map((n) => (n.id === entry.id ? { ...n, clicked: true } : n)));
    }
  }

  return (
    <div className="p-6 pb-12 max-w-2xl mx-auto">
      <header className="flex items-baseline justify-between mb-8">
        <h1 className="type-heading text-text">Notifications</h1>
        {saving && <span className="type-micro text-text-muted">Saving...</span>}
      </header>

      {/* Timezone */}
      <section className="card mb-6">
        <div className="flex items-center justify-between">
          <span className="type-label text-text-muted">Timezone</span>
          <span className="type-data text-text-secondary">{prefs.timezone}</span>
        </div>
      </section>

      {/* Supplement Reminders */}
      <section className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="type-label text-text-muted">Supplement Reminders</span>
          <Toggle
            enabled={prefs.supplements_enabled}
            onChange={(v) => save({ supplements_enabled: v })}
          />
        </div>
        <p className="type-micro text-text-muted mb-3">Reminds you to take untaken supplements</p>
        {prefs.supplements_enabled && (
          <div className="flex items-center gap-2">
            <span className="type-micro text-text-muted">Time</span>
            <TimePicker
              value={prefs.supplements_time}
              onChange={(v) => save({ supplements_time: v })}
            />
          </div>
        )}
      </section>

      {/* Workout Reminders */}
      <section className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="type-label text-text-muted">Workout Reminders</span>
          <Toggle enabled={prefs.workout_enabled} onChange={(v) => save({ workout_enabled: v })} />
        </div>
        <p className="type-micro text-text-muted mb-3">Nudge on programme training days</p>
        {prefs.workout_enabled && (
          <div className="flex items-center gap-2">
            <span className="type-micro text-text-muted">Time</span>
            <TimePicker value={prefs.workout_time} onChange={(v) => save({ workout_time: v })} />
          </div>
        )}
      </section>

      {/* Body Comp Check-in */}
      <section className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="type-label text-text-muted">Body Comp Check-in</span>
          <Toggle
            enabled={prefs.body_comp_enabled}
            onChange={(v) => save({ body_comp_enabled: v })}
          />
        </div>
        <p className="type-micro text-text-muted mb-3">Weekly weigh-in and measurement log</p>
        {prefs.body_comp_enabled && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="type-micro text-text-muted">Day</span>
              <div className="flex gap-1">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => save({ body_comp_day: i })}
                    className={`type-micro px-2 py-1 rounded transition-colors ${
                      prefs.body_comp_day === i
                        ? "bg-gold text-bg"
                        : "bg-bg-elevated text-text-muted hover:text-text"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="type-micro text-text-muted">Time</span>
              <TimePicker
                value={prefs.body_comp_time}
                onChange={(v) => save({ body_comp_time: v })}
              />
            </div>
          </div>
        )}
      </section>

      {/* Quiet Hours */}
      <section className="card mb-8">
        <span className="type-label text-text-muted block mb-2">Quiet Hours</span>
        <p className="type-micro text-text-muted mb-3">No notifications during these hours</p>
        <div className="flex items-center gap-3">
          <span className="type-micro text-text-muted">From</span>
          <TimePicker
            value={prefs.quiet_hours_start ?? "22:00"}
            onChange={(v) => save({ quiet_hours_start: v })}
          />
          <span className="type-micro text-text-muted">To</span>
          <TimePicker
            value={prefs.quiet_hours_end ?? "07:00"}
            onChange={(v) => save({ quiet_hours_end: v })}
          />
        </div>
      </section>

      {/* Recent Notifications */}
      <h2 className="type-subheading text-text mb-4">Recent</h2>
      {history.length === 0 ? (
        <p className="type-secondary text-text-muted">No notifications yet</p>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => handleClick(entry)}
              className={`card text-left transition-colors ${
                entry.clicked ? "opacity-60" : "border-gold/30"
              }`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="type-label text-text">
                  {!entry.clicked && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold mr-2" />
                  )}
                  {entry.payload.title}
                </span>
                <span className="type-micro text-text-muted">
                  {new Date(entry.sent_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="type-micro text-text-secondary">{entry.payload.body}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        enabled ? "bg-gold" : "bg-bg-elevated"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-bg-input border border-border rounded px-2 py-1 type-data text-text-secondary"
    >
      {TIMES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
