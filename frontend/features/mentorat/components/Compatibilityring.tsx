"use client";

import { motion } from "framer-motion";

interface CompatibilityRingProps {
  /** Score d'affinité entre 0 et 100 */
  score: number;
  size?: number;
}


//cmpst
export function CompatibilityRing({ score, size = 52 }: CompatibilityRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference * (1 - clamped / 100);
  const gradientId = "compatibility-ring-gradient";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Affinité de ${clamped}%`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">

          <stop offset="0%" stopColor="var(--color-brand-blue)" />
          <stop offset="100%" stopColor="var(--color-brand-rose)" />
        </linearGradient>
      </defs>

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-muted"
      />

      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />

      <text
        x="50%"
        y="50%"
        dy="0.32em"
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        {clamped}%
      </text>
    </svg>
  );
}