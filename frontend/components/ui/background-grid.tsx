"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackgroundGridProps {
  className?: string;
  /** Nombre de colonnes visibles (le CSS grid répète le motif au-delà) */
  cellSize?: number;
}

export function BackgroundGrid({ className, cellSize = 56 }: BackgroundGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden
    >
      {/* Grille de lignes */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      />

      {/* Masque radial : la grille s'estompe vers les bords */}
      <div
        className="absolute inset-0"
        style={{
          background: "hsl(var(--background))",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, transparent 20%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 40%, transparent 20%, black 100%)",
        }}
      />
    </motion.div>
  );
}