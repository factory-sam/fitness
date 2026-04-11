"use client";

import { useState } from "react";

interface Measurements {
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  upper_arm_r?: number;
}

interface VitruvianManProps {
  onRegionClick?: (region: string) => void;
  onRegionHover?: (region: string | null) => void;
  highlightedRegion?: string;
  measurements?: Measurements;
}

export function VitruvianMan({ onRegionClick, onRegionHover, highlightedRegion, measurements }: VitruvianManProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleHover = (region: string | null) => {
    setHovered(region);
    onRegionHover?.(region);
  };

  const getMeasurementLabel = (id: string): string | null => {
    if (!measurements) return null;
    const val = measurements[id as keyof Measurements];
    if (!val) return null;
    return `${val}"`;
  };

  const regions = [
    { id: "shoulders", label: "Shoulders", top: "24%", left: "18%", width: "64%", height: "7%" },
    { id: "chest", label: "Chest", top: "32%", left: "30%", width: "40%", height: "7%" },
    { id: "upper_arm_r", label: "Arm", top: "30%", left: "70%", width: "12%", height: "16%" },
    { id: "waist", label: "Waist", top: "47%", left: "34%", width: "32%", height: "7%" },
    { id: "hips", label: "Hips", top: "54%", left: "32%", width: "36%", height: "7%" },
  ];

  const measurementLines = [
    { id: "shoulders", y: "28%", x1: "20%", x2: "80%" },
    { id: "chest", y: "35%", x1: "30%", x2: "70%" },
    { id: "waist", y: "50%", x1: "36%", x2: "64%" },
    { id: "hips", y: "57%", x1: "33%", x2: "67%" },
  ];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* The actual Vitruvian Man SVG — colorized gold via CSS filter */}
      <div className="relative">
        <img
          src="/vitruvian-man.svg"
          alt="Vitruvian Man"
          className="w-full h-auto"
          style={{
            filter: "invert(72%) sepia(50%) saturate(400%) hue-rotate(5deg) brightness(90%)",
            opacity: 0.5,
          }}
        />

        {/* Measurement lines overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {measurementLines.map((line) => {
            const isActive = highlightedRegion === line.id || hovered === line.id;
            const label = getMeasurementLabel(line.id);
            return (
              <g key={line.id}>
                <line
                  x1={line.x1}
                  y1={line.y}
                  x2={line.x2}
                  y2={line.y}
                  stroke={isActive ? "#ffffff" : "rgba(200, 210, 220, 0.35)"}
                  strokeWidth={isActive ? "0.4" : "0.25"}
                  strokeDasharray="1.5,1.5"
                />
                <circle
                  cx={line.x1}
                  cy={line.y}
                  r={isActive ? "0.8" : "0.5"}
                  fill={isActive ? "#ffffff" : "rgba(200, 210, 220, 0.5)"}
                />
                <circle
                  cx={line.x2}
                  cy={line.y}
                  r={isActive ? "0.8" : "0.5"}
                  fill={isActive ? "#ffffff" : "rgba(200, 210, 220, 0.5)"}
                />
                {isActive && label && (
                  <>
                    <rect
                      x={parseFloat(line.x2) + 1.5}
                      y={parseFloat(line.y) - 2.2}
                      width="10"
                      height="4.4"
                      rx="1"
                      fill="#0a0a0a"
                      stroke="#ffffff"
                      strokeWidth="0.3"
                      opacity="0.9"
                    />
                    <text
                      x={parseFloat(line.x2) + 6.5}
                      y={parseFloat(line.y) + 1}
                      fill="#ffffff"
                      fontSize="3"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          {/* Arm measurement line (vertical) */}
          {(() => {
            const isArmActive = highlightedRegion === "upper_arm_r" || hovered === "upper_arm_r";
            const armLabel = getMeasurementLabel("upper_arm_r");
            return (
              <g>
                <line
                  x1="76%"
                  y1="32%"
                  x2="76%"
                  y2="44%"
                  stroke={isArmActive ? "#ffffff" : "rgba(200, 210, 220, 0.35)"}
                  strokeWidth={isArmActive ? "0.4" : "0.25"}
                  strokeDasharray="1.5,1.5"
                />
                <circle cx="76" cy="32" r={isArmActive ? 0.8 : 0.5} fill={isArmActive ? "#ffffff" : "rgba(200, 210, 220, 0.5)"} />
                <circle cx="76" cy="44" r={isArmActive ? 0.8 : 0.5} fill={isArmActive ? "#ffffff" : "rgba(200, 210, 220, 0.5)"} />
                {isArmActive && armLabel && (
                  <>
                    <rect x="78" y="36.8" width="10" height="4.4" rx="1" fill="#0a0a0a" stroke="#ffffff" strokeWidth="0.3" opacity="0.9" />
                    <text x="83" y="39.8" fill="#ffffff" fontSize="3" fontFamily="JetBrains Mono, monospace" textAnchor="middle">{armLabel}</text>
                  </>
                )}
              </g>
            );
          })()}
        </svg>

        {/* Clickable regions */}
        {regions.map((region) => {
          const isActive = highlightedRegion === region.id || hovered === region.id;
          return (
            <button
              key={region.id}
              className="absolute border border-transparent rounded transition-all duration-200 cursor-pointer"
              style={{
                top: region.top,
                left: region.left,
                width: region.width,
                height: region.height,
                backgroundColor: isActive
                  ? "rgba(201, 168, 76, 0.1)"
                  : "transparent",
                borderColor: isActive
                  ? "rgba(201, 168, 76, 0.3)"
                  : "transparent",
              }}
              onMouseEnter={() => handleHover(region.id)}
              onMouseLeave={() => handleHover(null)}
              onClick={() => onRegionClick?.(region.id)}
              title={region.label}
            />
          );
        })}
      </div>
    </div>
  );
}
