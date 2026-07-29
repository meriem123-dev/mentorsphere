import { ChevronRight } from "lucide-react";
import { ObjectiveCategoryBadge } from "./ObjectiveCategoryBadge";
import type { ObjectiveCategory } from "../../../types/workspaceTypes";

type Props = {
  title: string;
  category: ObjectiveCategory;
  progress: number;
  onClick: () => void;
};

export function ObjectiveCard({ title, category, progress, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl bg-card p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex-1  ">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <ObjectiveCategoryBadge category={category} />
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-gradient-rose-fade transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <ChevronRight className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}