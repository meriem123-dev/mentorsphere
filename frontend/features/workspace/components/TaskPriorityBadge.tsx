import type { TaskPriority } from "@/types/workspaceTypes";

export const PRIORITY_LABELS = ["Haute", "Moyenne", "Faible"] as const;
export type PriorityLabel = (typeof PRIORITY_LABELS)[number];

export const PRIORITY_LABEL_TO_VALUE: Record<PriorityLabel, TaskPriority> = {
  Haute: "high",
  Moyenne: "medium",
  Faible: "low",
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; dotClass: string; textClass: string }
> = {
  high: {
    label: "Haute",
    dotClass: "bg-destructive",
    textClass: "text-destructive",
  },
  medium: {
    label: "Moyenne",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  low: {
    label: "Faible",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.textClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}