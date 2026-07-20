import type { ProjectStage } from "@/types/entrepreneurTypes";

const STAGE_CONFIG: Record<ProjectStage, { label: string; className: string }> = {
  IDEE: { label: "Idée", className: "bg-info/10 text-info" },
  MVP: { label: "MVP", className: "bg-warning/10 text-warning" },
  SEED: { label: "Seed Stage", className: "bg-brand-rose/10 text-brand-rose" },
  CROISSANCE: { label: "Croissance", className: "bg-success/10 text-success" },
};

export function StageBadge({ stage }: { stage: ProjectStage }) {
  const config = STAGE_CONFIG[stage];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}