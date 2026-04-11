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
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const activeRegion = hoveredRegion ?? selectedRegion;

  return (
    <div className="card">
      <h2 className="section-heading mb-4">Measurements</h2>

      <div className="mb-6">
        <VitruvianMan
          onRegionClick={(region) =>
            setSelectedRegion(selectedRegion === region ? null : region)
          }
          onRegionHover={setHoveredRegion}
          highlightedRegion={activeRegion ?? undefined}
          measurements={{
            shoulders: latest?.shoulders as number | undefined,
            chest: latest?.chest as number | undefined,
            waist: latest?.waist as number | undefined,
            hips: latest?.hips as number | undefined,
            upper_arm_r: latest?.upper_arm_r as number | undefined,
          }}
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
            const isHighlighted = activeRegion === part.key;
            return (
              <tr
                key={part.key}
                className={`transition-colors duration-150 ${
                  isHighlighted ? "!bg-bg-elevated" : ""
                }`}
                onMouseEnter={() => setHoveredRegion(part.key)}
                onMouseLeave={() => setHoveredRegion(null)}
                style={{ cursor: "pointer" }}
              >
                <td className={isHighlighted ? "!text-white" : ""}>{part.label}</td>
                <td className={isHighlighted ? "!text-white font-semibold" : "text-gold"}>{value ? `${value}"` : "—"}</td>
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

      <p className="type-micro text-text-muted mt-3">
        Self-measured. Trend over time matters more than absolute values.
      </p>
    </div>
  );
}
