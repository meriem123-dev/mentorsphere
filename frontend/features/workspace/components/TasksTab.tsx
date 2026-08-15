"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/ComboBox";
import { TaskRow } from "./TaskRow";
import { AddTaskModal } from "./AddTaskModal";
import { PRIORITY_LABELS, PRIORITY_LABEL_TO_VALUE } from "./TaskPriorityBadge";
import { workspaceApi } from "../api/workspaceAPI";
import { toast } from "sonner";
import type {
  CreateTaskPayload,
  Task,
  WorkspaceMember,
} from "@/types/workspaceTypes";

type StatusFilter = "all" | "todo" | "done";

const PRIORITY_FILTER_OPTIONS = ["Toutes priorités", ...PRIORITY_LABELS];

type Props = {
  mentorshipId: string;
  tasks: Task[];
  members: WorkspaceMember[];
  canManage: boolean;
  onTasksChange: (update: Task[] | ((prev: Task[]) => Task[])) => void;
};

export function TasksTab({
  mentorshipId,
  tasks,
  members,
  canManage,
  onTasksChange,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [assigneeLabel, setAssigneeLabel] = useState("Tous les membres");
  const [priorityLabel, setPriorityLabel] = useState("Toutes priorités");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.userId, m])),
    [members],
  );

  const completedCount = tasks.filter((t) => t.status === "done").length;

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === "todo" && task.status !== "todo") return false;
    if (statusFilter === "done" && task.status !== "done") return false;

    if (assigneeLabel !== "Tous les membres") {
      const assignee = memberById.get(task.assigneeId);
      if (assignee?.name !== assigneeLabel) return false;
    }

    if (priorityLabel !== "Toutes priorités") {
      if (
        task.priority !==
        PRIORITY_LABEL_TO_VALUE[priorityLabel as keyof typeof PRIORITY_LABEL_TO_VALUE]
      ) {
        return false;
      }
    }

    return true;
  });

  const handleToggleStatus = async (taskId: string) => {
    const previous = tasks.find((t) => t.id === taskId);
    if (!previous) return;

    const nextStatus = previous.status === "done" ? "todo" : "done";

    // mise à jour optimiste (fonctionnelle pour éviter d'écraser un état plus récent)
    onTasksChange(
      tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)),
    );

    try {
      const updated = await workspaceApi.updateTask(mentorshipId, taskId, {
        status: nextStatus,
      });
      onTasksChange((prev: Task[]) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t)),
      );
    } catch {
      toast.error("Impossible de mettre à jour la tâche");
      // rollback ciblé sur cette tâche uniquement, pas un remplacement global
      onTasksChange((prev: Task[]) =>
        prev.map((t) => (t.id === taskId ? previous : t)),
      );
    }
  };

  const handleCreate = async (payload: CreateTaskPayload) => {
    try {
      const created = await workspaceApi.createTask(mentorshipId, payload);
      onTasksChange((prev: Task[]) => [...prev, created]);
      toast.success("Tâche ajoutée");
    } catch {
      toast.error("Impossible d'ajouter la tâche");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      {/* progression */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-sm font-medium text-foreground">
          Progression des tâches
        </span>
        <span className="text-sm font-medium text-brand-blue">
          {completedCount}/{tasks.length} complétées
        </span>
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-brand transition-all"
            style={{
              width: tasks.length
                ? `${(completedCount / tasks.length) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>

      {/* filtres */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {(
              [
                { key: "all", label: "Toutes" },
                { key: "todo", label: "À faire" },
                { key: "done", label: "Terminées" },
              ] as { key: StatusFilter; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-44">
            <ComboBox
              label="Membre"
              hideLabel
              size="sm"
              searchable={false}
              options={["Tous les membres", ...members.map((m) => m.name)]}
              value={assigneeLabel}
              onChange={setAssigneeLabel}
            />
          </div>

          <div className="w-40">
            <ComboBox
              label="Priorité"
              hideLabel
              size="sm"
              searchable={false}
              options={PRIORITY_FILTER_OPTIONS}
              value={priorityLabel}
              onChange={setPriorityLabel}
            />
          </div>
        </div>

        {canManage && (
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus />
            Ajouter une tâche
          </Button>
        )}
      </div>

      {/* en-tête tableau */}
      <div className="grid grid-cols-[1fr_100px_140px_140px] gap-3 border-t border-border bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>Tâche</span>
        <span>Priorité</span>
        <span>Assigné</span>
        <span>Échéance</span>
      </div>

      {/* lignes */}
      <div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              assignee={memberById.get(task.assigneeId)}
              canManage={canManage}
              onToggleStatus={handleToggleStatus}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aucune tâche ne correspond aux filtres.
          </div>
        )}
      </div>

      <AddTaskModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        members={members}
        onCreate={handleCreate}
      />
    </div>
  );
}