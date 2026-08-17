"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import type { StartupStep } from "@/types/startupTypes";
import { getStepMeta, getStepStatus, STATUS_LABEL, type StepStatus } from "@/features/projets/utils/stepMeta";

const STATUS_BADGE_CLASS: Record<StepStatus, string> = {
  DONE: "bg-success/10 text-success",
  CURRENT: "bg-brand-blue/10 text-brand-blue",
  UPCOMING: "bg-muted text-muted-foreground",
};

const ICON_WRAPPER_CLASS: Record<StepStatus, string> = {
  DONE: "border-success/40 bg-success/10 text-success",
  CURRENT: "border-brand-blue/40 bg-brand-blue/10 text-brand-blue",
  UPCOMING: "border-border bg-muted/40 text-muted-foreground",
};

type Props = {
  step: StartupStep;
  index: number;
  steps: StartupStep[];
  isOwner: boolean;
  isToggling: boolean;
  onToggle: (index: number) => void;
};

export function StepRow({ step, index, steps, isOwner, isToggling, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false);
  const status = getStepStatus(steps, index);
  const { icon: Icon, description } = getStepMeta(step.title);

  return (
    <div className="flex gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${ICON_WRAPPER_CLASS[status]}`}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3.5 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{step.title}</p>
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
              {STATUS_LABEL[status]}
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </button>

        {expanded && isOwner && (
          <div className="mt-3 border-t border-border pt-3">
            <button
              type="button"
              disabled={isToggling}
              onClick={() => onToggle(index)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
            >
              {isToggling && <Loader2 className="h-3 w-3 animate-spin" />}
              {step.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}