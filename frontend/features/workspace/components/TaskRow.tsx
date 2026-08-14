import { AlertTriangle, Check } from "lucide-react";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import type { Task, WorkspaceMember } from "@/types/workspaceTypes";

type Props = {
  task: Task;
  assignee?: WorkspaceMember;
  canManage: boolean;
  onToggleStatus: (taskId: string) => void;
};

function formatDueDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function TaskRow({ task, assignee, canManage, onToggleStatus }: Props) {
  const isDone = task.status === "done";

  return (
    <div className="grid grid-cols-[1fr_100px_140px_140px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          disabled={!canManage}
          onClick={() => onToggleStatus(task.id)}
          aria-label={isDone ? "Marquer comme à faire" : "Marquer comme terminée"}
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
            isDone
              ? "border-brand-blue bg-brand-blue"
              : "border-input bg-background"
          } ${!canManage ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          {isDone && <Check size={12} className="text-white" />}
        </button>
        <span
          className={`truncate text-sm ${
            isDone ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </span>
      </div>

      <TaskPriorityBadge priority={task.priority} />

      <div className="flex items-center gap-2 min-w-0">
        {assignee && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-[10px] font-semibold text-brand-blue">
            {assignee.initials}
          </span>
        )}
        <span className="truncate text-sm text-foreground">
          {assignee?.name ?? "—"}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
        <AlertTriangle size={12} />
        {formatDueDate(task.dueDate)}
      </div>
    </div>
  );
}