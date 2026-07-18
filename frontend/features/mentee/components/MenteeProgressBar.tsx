"use client";

import { motion } from "framer-motion";

interface MenteeProgressBarProps {
  value: number; // 0-100
}

export function MenteeProgressBar({ value }: MenteeProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Progression</span>
        <span className="font-semibold text-brand-rose tabular-nums">
          {clamped}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-brand"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}