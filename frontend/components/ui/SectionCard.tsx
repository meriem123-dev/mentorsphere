"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function SectionCard({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}