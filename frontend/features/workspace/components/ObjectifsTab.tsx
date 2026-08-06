"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ObjectiveCard } from "./ObjectiveCard";
import { ObjectiveModal, type ObjectiveFormData } from "./ObjectiveModal";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";
import type { Objective } from "@/types/workspaceTypes";

type Props = {
  mentorshipId: string;
  objectives: Objective[];
  onObjectivesChange: (objectives: Objective[]) => void;
};

export function ObjectifsTab({ mentorshipId, objectives, onObjectivesChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Objective | undefined>(undefined);

  const openCreate = () => {
    setEditTarget(undefined);
    setModalOpen(true);
  };

  const openEdit = (objective: Objective) => {
    setEditTarget(objective);
    setModalOpen(true);
  };

  const handleSubmit = async (data: ObjectiveFormData) => {
    if (editTarget) {
      const updated = await workspaceApi.updateObjective(mentorshipId, editTarget.id, data);
      onObjectivesChange(
        objectives.map((o) => (o.id === editTarget.id ? updated : o)),
      );
      toast.success("Objectif mis à jour");
    } else {
      const created = await workspaceApi.createObjective(mentorshipId, data);
      onObjectivesChange([...objectives, created]);
      toast.success("Objectif créé");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {objectives.length} objectifs
        </h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-2 text-xs font-medium text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter un objectif
        </button>
      </div>

      <div className="space-y-2">
        {objectives.map((objective) => (
          <ObjectiveCard
            key={objective.id}
            title={objective.title}
            category={objective.category}
            progress={objective.progress}
            onClick={() => openEdit(objective)}
          />
        ))}
      </div>

      <ObjectiveModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={editTarget ? "edit" : "create"}
        initialData={editTarget}
        onSubmit={handleSubmit}
      />
    </div>
  );
}