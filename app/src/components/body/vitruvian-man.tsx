"use client";

import { useState } from "react";

interface VitruvianManProps {
  onRegionClick?: (region: string) => void;
  highlightedRegion?: string;
}

export function VitruvianMan({ onRegionClick, highlightedRegion }: VitruvianManProps) {
  const [hovered, setHovered] = useState<string | null>(null);

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
            return (
              <g key={line.id}>
                <line
                  x1={line.x1}
                  y1={line.y}
                  x2={line.x2}
                  y2={line.y}
                  stroke={isActive ? "#c9a84c" : "#8b7335"}
                  strokeWidth="0.3"
                  strokeDasharray="1.5,1.5"
                  opacity={isActive ? 0.9 : 0.4}
                />
                <circle
                  cx={line.x1}
                  cy={line.y}
                  r="0.6"
                  fill={isActive ? "#c9a84c" : "#8b7335"}
                  opacity={isActive ? 1 : 0.5}
                />
                <circle
                  cx={line.x2}
                  cy={line.y}
                  r="0.6"
                  fill={isActive ? "#c9a84c" : "#8b7335"}
                  opacity={isActive ? 1 : 0.5}
                />
              </g>
            );
          })}
          {/* Arm measurement line (vertical-ish) */}
          <line
            x1="76%"
            y1="32%"
            x2="76%"
            y2="44%"
            stroke={
              highlightedRegion === "upper_arm_r" || hovered === "upper_arm_r"
                ? "#c9a84c"
                : "#8b7335"
            }
            strokeWidth="0.3"
            strokeDasharray="1.5,1.5"
            opacity={
              highlightedRegion === "upper_arm_r" || hovered === "upper_arm_r"
                ? 0.9
                : 0.4
            }
          />
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
              onMouseEnter={() => setHovered(region.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onRegionClick?.(region.id)}
              title={region.label}
            />
          );
        })}
      </div>
    </div>
  );
}
