"use client";

import { useState } from "react";
import { VitruvianMan } from "./vitruvian-man";

interface MeasurementData {
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  upper_arm_r?: number;
  date?: string;
  [key: string]: unknown;
}

const bodyParts = [
  { key: "shoulders", label: "Shoulders" },
  { key: "chest", label: "Chest" },
  { key: "upper_arm_r", label: "Arm (R)" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
];

export function MeasurementDisplay({
  latest,
  history,
  swRatio,
}: {
  latest?: MeasurementData;
  history: MeasurementData[];
  swRatio: string | null;
}) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  return (
    <div className="card">
      <h2 className="section-heading mb-4">Measurements</h2>

      <div className="mb-6">
        <VitruvianMan
          onRegionClick={(region) =>
            setSelectedRegion(selectedRegion === region ? null : region)
          }
          highlightedRegion={selectedRegion ?? undefined}
        />
      </div>

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Measurement</th>
            <th>Value</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {bodyParts.map((part) => {
            const value = latest?.[part.key as keyof MeasurementData] as number | undefined;
            return (
              <tr key={part.key}>
                <td>{part.label}</td>
                <td className="text-gold">{value ? `${value}"` : "—"}</td>
                <td className="text-text-muted">{latest?.date ?? "—"}</td>
              </tr>
            );
          })}
          <tr>
            <td className="font-semibold">S/W Ratio</td>
            <td className="text-gold font-semibold">{swRatio ?? "—"}</td>
            <td className="text-text-muted">Target: 1.57</td>
          </tr>
        </tbody>
      </table>

      <p className="font-mono text-[10px] text-text-muted mt-3">
        Self-measured. Trend over time matters more than absolute values.
      </p>
    </div>
  );
}
