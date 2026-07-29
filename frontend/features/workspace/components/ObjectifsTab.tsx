import { Plus } from "lucide-react";
import { ObjectiveCard } from "./ObjectiveCard";
import type { Objective } from "../../../types/workspaceTypes";

type Props = {
  objectives: Objective[];
  onViewObjective: (objectiveId: string) => void;
  onAddGoal: () => void;
};

export function ObjectifsTab({ objectives, onViewObjective, onAddGoal }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {objectives.length} objectifs
        </h3>
        <button
          onClick={onAddGoal}
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
            onClick={() => onViewObjective(objective.id)}
          />
        ))}
      </div>
    </div>
  );
}