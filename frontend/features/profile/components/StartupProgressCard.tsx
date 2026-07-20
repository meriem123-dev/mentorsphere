"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { StageBadge } from "./StageBadge";
import type { StartupSummary } from "@/types/entrepreneurTypes";

export function StartupProgressCard({ startup }: { startup: StartupSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-muted/40 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-semibold text-foreground">{startup.name}</h4>
            <StageBadge stage={startup.stage} />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {startup.description}
          </p>
        </div>
        {startup.isRecruiting && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <Users className="h-3 w-3" />
            Recrute
          </span>
        )}
      </div>

      {startup.needs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {startup.needs.map((need) => (
            <span
              key={need}
              className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground"
            >
              {need}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progression</span>
          <span className="font-medium text-foreground">{startup.progress}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-gradient-brand transition-all"
            style={{ width: `${startup.progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}