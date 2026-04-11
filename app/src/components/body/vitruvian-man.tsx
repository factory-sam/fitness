"use client";

import { useState } from "react";

interface VitruvianManProps {
  onRegionClick?: (region: string) => void;
  highlightedRegion?: string;
}

export function VitruvianMan({ onRegionClick, highlightedRegion }: VitruvianManProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const regionProps = (region: string) => ({
    className: "cursor-pointer transition-opacity",
    opacity:
      highlightedRegion === region || hovered === region ? 1 : 0.6,
    onMouseEnter: () => setHovered(region),
    onMouseLeave: () => setHovered(null),
    onClick: () => onRegionClick?.(region),
  });

  const gold = "#c9a84c";
  const goldDim = "#8b7335";
  const goldFaint = "#5a4d2a";

  return (
    <svg
      viewBox="0 0 200 260"
      className="w-full max-w-xs mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle — da Vinci framing */}
      <circle
        cx="100"
        cy="120"
        r="95"
        stroke={goldFaint}
        strokeWidth="0.5"
        opacity="0.3"
      />
      {/* Square — da Vinci framing */}
      <rect
        x="20"
        y="28"
        width="160"
        height="210"
        stroke={goldFaint}
        strokeWidth="0.5"
        opacity="0.2"
      />

      {/* === FIGURE — PRIMARY POSE === */}
      <g stroke={gold} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <ellipse cx="100" cy="48" rx="10" ry="12" opacity="0.6" />
        {/* Face detail — center line */}
        <line x1="100" y1="40" x2="100" y2="54" opacity="0.15" />
        {/* Eyes */}
        <line x1="95" y1="45" x2="97" y2="45" opacity="0.25" />
        <line x1="103" y1="45" x2="105" y2="45" opacity="0.25" />

        {/* Neck */}
        <line x1="95" y1="59" x2="95" y2="66" opacity="0.5" />
        <line x1="105" y1="59" x2="105" y2="66" opacity="0.5" />

        {/* Trapezius */}
        <path d="M95,62 Q85,64 72,70" opacity="0.4" />
        <path d="M105,62 Q115,64 128,70" opacity="0.4" />

        {/* Shoulders — deltoids */}
        <g {...regionProps("shoulders")}>
          {/* Left delt */}
          <path d="M72,70 Q64,72 60,80 Q62,84 68,84" stroke={gold} strokeWidth="1.2" />
          <path d="M68,76 Q65,78 64,80" opacity="0.3" />
          {/* Right delt */}
          <path d="M128,70 Q136,72 140,80 Q138,84 132,84" stroke={gold} strokeWidth="1.2" />
          <path d="M132,76 Q135,78 136,80" opacity="0.3" />
        </g>

        {/* Chest — pectorals */}
        <g {...regionProps("chest")}>
          <path d="M72,70 Q80,72 88,78 Q94,80 100,78 Q106,80 112,78 Q120,72 128,70" strokeWidth="1.1" />
          {/* Pec detail — sternal split */}
          <line x1="100" y1="72" x2="100" y2="88" opacity="0.2" />
          {/* Pec contour lines */}
          <path d="M78,76 Q88,82 96,80" opacity="0.2" />
          <path d="M122,76 Q112,82 104,80" opacity="0.2" />
          {/* Lower pec line */}
          <path d="M80,84 Q90,90 100,88 Q110,90 120,84" opacity="0.25" />
        </g>

        {/* Ribcage / serratus */}
        <path d="M80,86 Q78,92 78,98" opacity="0.15" />
        <path d="M120,86 Q122,92 122,98" opacity="0.15" />
        <path d="M82,90 Q80,94 80,96" opacity="0.12" />
        <path d="M118,90 Q120,94 120,96" opacity="0.12" />

        {/* Torso outline */}
        <path d="M68,84 L74,100 L76,118" opacity="0.5" />
        <path d="M132,84 L126,100 L124,118" opacity="0.5" />

        {/* Waist / obliques */}
        <g {...regionProps("waist")}>
          <path d="M76,118 Q80,122 84,126" strokeWidth="1.1" />
          <path d="M124,118 Q120,122 116,126" strokeWidth="1.1" />
          {/* Ab lines */}
          <line x1="100" y1="90" x2="100" y2="126" opacity="0.2" />
          <line x1="92" y1="92" x2="92" y2="124" opacity="0.12" />
          <line x1="108" y1="92" x2="108" y2="124" opacity="0.12" />
          {/* Horizontal ab separations */}
          <line x1="92" y1="96" x2="108" y2="96" opacity="0.12" />
          <line x1="92" y1="104" x2="108" y2="104" opacity="0.12" />
          <line x1="92" y1="112" x2="108" y2="112" opacity="0.12" />
          <line x1="94" y1="120" x2="106" y2="120" opacity="0.12" />
          {/* Navel */}
          <circle cx="100" cy="116" r="1.5" opacity="0.15" />
        </g>

        {/* Hips / pelvis */}
        <g {...regionProps("hips")}>
          <path d="M84,126 Q88,132 92,136 L100,138 L108,136 Q112,132 116,126" strokeWidth="1.1" />
          {/* Iliac crest */}
          <path d="M82,124 Q90,130 100,132 Q110,130 118,124" opacity="0.2" />
        </g>

        {/* === ARMS === */}
        {/* Left arm */}
        <g {...regionProps("upper_arm_r")}>
          {/* Upper arm — bicep/tricep */}
          <path d="M60,80 L54,100 L52,108" strokeWidth="1.1" />
          <path d="M68,84 L62,100 L60,108" strokeWidth="1.1" />
          {/* Bicep contour */}
          <path d="M62,88 Q58,94 56,100" opacity="0.25" />
          {/* Tricep contour */}
          <path d="M66,88 Q64,94 62,100" opacity="0.2" />
        </g>
        {/* Left forearm */}
        <path d="M52,108 L46,130 L44,142" opacity="0.5" />
        <path d="M60,108 L54,130 L50,142" opacity="0.5" />
        {/* Left hand */}
        <path d="M44,142 L40,152 M46,142 L44,154 M48,142 L47,154 M50,142 L50,153 M50,142 L53,150" opacity="0.35" />

        {/* Right arm */}
        <g {...regionProps("upper_arm_r")}>
          <path d="M140,80 L146,100 L148,108" strokeWidth="1.1" />
          <path d="M132,84 L138,100 L140,108" strokeWidth="1.1" />
          <path d="M138,88 Q142,94 144,100" opacity="0.25" />
          <path d="M134,88 Q136,94 138,100" opacity="0.2" />
        </g>
        {/* Right forearm */}
        <path d="M148,108 L154,130 L156,142" opacity="0.5" />
        <path d="M140,108 L146,130 L150,142" opacity="0.5" />
        {/* Right hand */}
        <path d="M156,142 L160,152 M154,142 L156,154 M152,142 L153,154 M150,142 L150,153 M150,142 L147,150" opacity="0.35" />

        {/* === LEGS === */}
        {/* Left leg */}
        <path d="M92,136 L86,160 L82,180 L80,200" opacity="0.5" strokeWidth="1.1" />
        <path d="M100,138 L94,160 L92,180 L90,200" opacity="0.5" strokeWidth="1.1" />
        {/* Quad detail */}
        <path d="M90,142 Q88,155 84,168" opacity="0.15" />
        <path d="M96,142 Q94,155 92,168" opacity="0.15" />
        {/* Knee */}
        <ellipse cx="86" cy="182" rx="5" ry="3" opacity="0.15" />
        {/* Calf */}
        <path d="M80,200 L78,218 L80,232" opacity="0.45" />
        <path d="M90,200 L88,218 L86,232" opacity="0.45" />
        {/* Calf muscle contour */}
        <path d="M82,202 Q80,210 80,216" opacity="0.15" />
        {/* Left foot */}
        <path d="M80,232 L74,238 M86,232 L74,238" opacity="0.35" />

        {/* Right leg */}
        <path d="M108,136 L114,160 L118,180 L120,200" opacity="0.5" strokeWidth="1.1" />
        <path d="M100,138 L106,160 L108,180 L110,200" opacity="0.5" strokeWidth="1.1" />
        <path d="M110,142 Q112,155 116,168" opacity="0.15" />
        <path d="M104,142 Q106,155 108,168" opacity="0.15" />
        <ellipse cx="114" cy="182" rx="5" ry="3" opacity="0.15" />
        <path d="M120,200 L122,218 L120,232" opacity="0.45" />
        <path d="M110,200 L112,218 L114,232" opacity="0.45" />
        <path d="M118,202 Q120,210 120,216" opacity="0.15" />
        <path d="M120,232 L126,238 M114,232 L126,238" opacity="0.35" />

        {/* === SECONDARY POSE — Extended arms (da Vinci style) === */}
        <g opacity="0.15">
          {/* Left arm extended */}
          <path d="M72,70 L44,78 L22,90 L10,96" />
          {/* Right arm extended */}
          <path d="M128,70 L156,78 L178,90 L190,96" />
          {/* Left leg spread */}
          <path d="M92,136 L72,170 L60,210 L56,238" />
          {/* Right leg spread */}
          <path d="M108,136 L128,170 L140,210 L144,238" />
        </g>
      </g>

      {/* === MEASUREMENT LINES === */}
      <g stroke={goldDim} strokeWidth="0.5" strokeDasharray="3,3" opacity="0.5">
        {/* Shoulder line */}
        <line x1="55" y1="72" x2="145" y2="72" />
        {/* Chest line */}
        <line x1="68" y1="82" x2="132" y2="82" />
        {/* Waist line */}
        <line x1="74" y1="118" x2="126" y2="118" />
        {/* Hip line */}
        <line x1="82" y1="132" x2="118" y2="132" />
        {/* Arm line (right) */}
        <line x1="138" y1="86" x2="148" y2="86" />
      </g>

      {/* Measurement dots at line endpoints */}
      <g fill={gold}>
        <circle cx="55" cy="72" r="1.5" opacity="0.6" />
        <circle cx="145" cy="72" r="1.5" opacity="0.6" />
        <circle cx="68" cy="82" r="1.5" opacity="0.6" />
        <circle cx="132" cy="82" r="1.5" opacity="0.6" />
        <circle cx="74" cy="118" r="1.5" opacity="0.6" />
        <circle cx="126" cy="118" r="1.5" opacity="0.6" />
        <circle cx="82" cy="132" r="1.5" opacity="0.6" />
        <circle cx="118" cy="132" r="1.5" opacity="0.6" />
        <circle cx="148" cy="86" r="1.5" opacity="0.6" />
      </g>
    </svg>
  );
}
