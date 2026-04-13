"use client";

import { EmptyState } from "../ui/empty-state";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface BodyCompEntry {
  date?: string;
  weight_lbs?: number;
  body_fat_pct?: number;
  vo2_max?: number;
  [key: string]: unknown;
}

interface MeasurementEntry {
  date?: string;
  shoulders?: number;
  waist?: number;
  upper_arm_r?: number;
  [key: string]: unknown;
}

export function BodyCompChart({
  history,
  measurements,
}: {
  history: BodyCompEntry[];
  measurements: MeasurementEntry[];
}) {
  const data = [...history].reverse().map((entry) => {
    const m = measurements.find((me) => me.date === entry.date);
    return {
      date: entry.date,
      weight: entry.weight_lbs,
      bf: entry.body_fat_pct,
      vo2: entry.vo2_max,
      waist: m?.waist,
      arm: m?.upper_arm_r,
    };
  });

  if (data.length <= 1) {
    return (
      <div className="card">
        <h2 className="section-heading mb-4">Body Composition</h2>
        {data.length === 1 && (
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="metric-value text-lg">{data[0].weight ?? "—"}</p>
              <p className="metric-label">lbs</p>
            </div>
            <div className="text-center">
              <p className="metric-value text-lg">{data[0].bf ?? "—"}%</p>
              <p className="metric-label">body fat</p>
            </div>
            <div className="text-center">
              <p className="metric-value text-lg">{data[0].vo2 ?? "—"}</p>
              <p className="metric-label">VO₂ Max</p>
            </div>
          </div>
        )}
        <EmptyState
          icon="◉"
          title={data.length === 0 ? "No body composition data" : "Need more data points"}
          description={
            data.length === 0
              ? "Log your weight, body fat, and measurements to track composition trends over time."
              : "Log at least two weigh-ins to see your composition trend chart."
          }
          action={{ label: "Log Weigh-In", href: "/body" }}
          compact={data.length === 1}
        />
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-heading mb-4">Body Composition</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              stroke="var(--color-border)"
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              stroke="var(--color-border)"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "JetBrains Mono" }}
              stroke="var(--color-border)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                fontFamily: "JetBrains Mono",
                fontSize: 11,
              }}
              labelStyle={{ color: "var(--color-gold)" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              stroke="var(--color-gold)"
              strokeWidth={2}
              dot={{ fill: "var(--color-gold)", r: 3 }}
              name="Weight (lbs)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bf"
              stroke="var(--color-info)"
              strokeWidth={2}
              dot={{ fill: "var(--color-info)", r: 3 }}
              name="Body Fat %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
