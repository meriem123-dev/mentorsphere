"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/ComboBox";
import type { CreateTaskPayload, TaskPriority, WorkspaceMember } from "@/types/workspaceTypes";

const PRIORITY_OPTIONS: Record<string, TaskPriority> = {
  Haute: "high",
  Moyenne: "medium",
  Faible: "low",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: WorkspaceMember[];
  onCreate: (payload: CreateTaskPayload) => Promise<void>;
};

export function AddTaskModal({ open, onOpenChange, members, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [priorityLabel, setPriorityLabel] = useState("");
  const [assigneeLabel, setAssigneeLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const memberByName = new Map(members.map((m) => [m.name, m]));

  const handleSubmit = async () => {
    const assignee = memberByName.get(assigneeLabel);
    const priority = PRIORITY_OPTIONS[priorityLabel];
    if (!title.trim() || !assignee || !priority || !dueDate) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        priority,
        assigneeId: assignee.userId,
        dueDate: new Date(dueDate).toISOString(),
      });
      setTitle("");
      setPriorityLabel("");
      setAssigneeLabel("");
      setDueDate("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Ajouter une tâche
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Titre
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Mettre à jour la section GTM du pitch deck"
              className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <ComboBox
            label="Priorité"
            placeholder="Sélectionnez une priorité"
            options={Object.keys(PRIORITY_OPTIONS)}
            value={priorityLabel}
            onChange={setPriorityLabel}
            searchable={false}
          />

          <ComboBox
            label="Assigné à"
            placeholder="Sélectionnez un membre"
            options={members.map((m) => m.name)}
            value={assigneeLabel}
            onChange={setAssigneeLabel}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Échéance
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
      </div>
    </div>
  );
}