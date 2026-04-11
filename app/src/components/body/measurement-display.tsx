"use client";

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
  { key: "shoulders", label: "Shoulders", y: 22, x: 50 },
  { key: "chest", label: "Chest", y: 35, x: 50 },
  { key: "upper_arm_r", label: "Arm (R)", y: 32, x: 22 },
  { key: "waist", label: "Waist", y: 48, x: 50 },
  { key: "hips", label: "Hips", y: 55, x: 50 },
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
  return (
    <div className="card">
      <h2 className="section-heading mb-4">Measurements</h2>

      <div className="relative w-full max-w-xs mx-auto mb-6">
        {/* Simplified body outline */}
        <svg viewBox="0 0 100 120" className="w-full opacity-20">
          {/* Head */}
          <circle cx="50" cy="10" r="6" stroke="currentColor" fill="none" strokeWidth="0.5" />
          {/* Neck */}
          <line x1="50" y1="16" x2="50" y2="20" stroke="currentColor" strokeWidth="0.5" />
          {/* Shoulders */}
          <line x1="30" y1="22" x2="70" y2="22" stroke="currentColor" strokeWidth="0.5" />
          {/* Torso */}
          <path d="M30,22 L28,55 L38,58 L50,60 L62,58 L72,55 L70,22" stroke="currentColor" fill="none" strokeWidth="0.5" />
          {/* Arms */}
          <path d="M30,22 L22,45 L20,60" stroke="currentColor" fill="none" strokeWidth="0.5" />
          <path d="M70,22 L78,45 L80,60" stroke="currentColor" fill="none" strokeWidth="0.5" />
          {/* Legs */}
          <path d="M38,58 L35,90 L32,115" stroke="currentColor" fill="none" strokeWidth="0.5" />
          <path d="M62,58 L65,90 L68,115" stroke="currentColor" fill="none" strokeWidth="0.5" />
          {/* Waist line */}
          <line x1="32" y1="48" x2="68" y2="48" stroke="#c9a84c" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.5" />
          {/* Shoulder line */}
          <line x1="28" y1="22" x2="72" y2="22" stroke="#c9a84c" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.5" />
        </svg>

        {/* Measurement labels overlaid */}
        {bodyParts.map((part) => {
          const value = latest?.[part.key as keyof MeasurementData] as number | undefined;
          return (
            <div
              key={part.key}
              className="absolute font-mono text-[10px]"
              style={{
                top: `${part.y}%`,
                left: `${part.x}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="text-text-muted">{part.label}: </span>
              <span className="text-gold">{value ? `${value}"` : "—"}</span>
            </div>
          );
        })}
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
