"use client";

import { getLocalDateString } from "../../lib/date";

interface StreakData {
  id: number;
  name: string;
  streak: number;
  longest: number;
}

interface ComplianceDay {
  date: string;
  taken_count: number;
  compliance: number;
}

interface ComplianceData {
  totalActive: number;
  dailyCompliance: ComplianceDay[];
}

function getWeekDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(getLocalDateString(d));
  }
  return dates;
}

function getLast12Weeks(): string[][] {
  const weeks: string[][] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const thisSunday = new Date(now);
  thisSunday.setDate(now.getDate() - dayOfWeek);

  for (let w = 11; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(thisSunday);
      day.setDate(thisSunday.getDate() - w * 7 + d);
      if (day <= now) {
        week.push(getLocalDateString(day));
      }
    }
    weeks.push(week);
  }
  return weeks;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function ComplianceChart({
  streaks,
  compliance,
}: {
  streaks: StreakData[];
  compliance: ComplianceData;
}) {
  const complianceMap = new Map(compliance.dailyCompliance.map((d) => [d.date, d.compliance]));
  const weekDates = getWeekDates();
  const heatmapWeeks = getLast12Weeks();

  return (
    <div className="card space-y-5">
      <h2 className="section-heading">Streaks & Compliance</h2>

      {/* Streak counters */}
      {streaks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {streaks.map((s) => (
            <div
              key={s.id}
              className="bg-bg-elevated rounded-md px-3 py-2.5 border border-border-subtle"
            >
              <p className="font-mono text-xs text-text-secondary truncate">{s.name}</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-mono text-lg text-success font-semibold">{s.streak}</span>
                <span className="type-micro text-text-muted">day{s.streak !== 1 ? "s" : ""}</span>
              </div>
              <p className="type-micro text-text-muted mt-0.5">best: {s.longest}</p>
            </div>
          ))}
        </div>
      )}

      {/* Weekly compliance bar chart */}
      <div>
        <p className="type-label text-text-muted mb-2">This Week</p>
        <div className="flex items-end gap-1 h-16">
          {weekDates.map((date, i) => {
            const val = complianceMap.get(date) ?? 0;
            const todayStr = getLocalDateString();
            const isFuture = date > todayStr;
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-sm overflow-hidden h-12 flex items-end ${
                    isFuture ? "border border-dashed border-border-subtle" : "bg-bg-elevated"
                  }`}
                >
                  {!isFuture && (
                    <div
                      className="w-full rounded-sm transition-all duration-300"
                      style={{
                        height: `${Math.max(val * 100, val > 0 ? 8 : 0)}%`,
                        backgroundColor:
                          val >= 1
                            ? "var(--color-gold)"
                            : val >= 0.5
                              ? "var(--color-gold-dim)"
                              : val > 0
                                ? "var(--color-gold-muted)"
                                : "transparent",
                      }}
                    />
                  )}
                </div>
                <span
                  className={`type-micro ${isFuture ? "text-text-muted/50" : "text-text-muted"}`}
                >
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <p className="type-label text-text-muted mb-2">12-Week Adherence</p>
        <div className="flex gap-[3px]">
          {heatmapWeeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((date) => {
                const val = complianceMap.get(date) ?? 0;
                const todayStr = getLocalDateString();
                const isFuture = date > todayStr;
                return (
                  <div
                    key={date}
                    className="w-3 h-3 rounded-[2px] transition-colors"
                    style={{
                      backgroundColor: isFuture
                        ? "var(--color-bg-elevated)"
                        : val >= 1
                          ? "var(--color-gold)"
                          : val >= 0.75
                            ? "var(--color-gold-dim)"
                            : val >= 0.5
                              ? "#4a3d1a"
                              : val > 0
                                ? "#2d2410"
                                : "#1a1508",
                    }}
                    title={`${date}: ${Math.round(val * 100)}%`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-2">
          <span className="type-micro text-text-muted">Less</span>
          {["#1a1508", "#2d2410", "#4a3d1a", "var(--color-gold-dim)", "var(--color-gold)"].map(
            (bg, i) => (
              <div key={i} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: bg }} />
            ),
          )}
          <span className="type-micro text-text-muted">More</span>
        </div>
      </div>
    </div>
  );
}
