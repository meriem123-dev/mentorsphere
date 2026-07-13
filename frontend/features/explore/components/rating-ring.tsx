"use client";

import { useEffect, useState } from "react";

interface RatingRingProps {
  rating: number; 
  size?: number;
  strokeWidth?: number;
}

export function RatingRing({ rating, size = 60, strokeWidth = 3 }: RatingRingProps) {
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(rating / 5, 1);

  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#13496B" />
          <stop offset="100%" stopColor="#A31C44" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="stroke-border"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}