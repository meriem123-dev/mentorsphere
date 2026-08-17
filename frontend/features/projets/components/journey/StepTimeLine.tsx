import type { StartupStep } from "@/types/startupTypes";
import { getStepStatus } from "@/features/projets/utils/stepMeta";
import { StepRow } from "./StepRow";

type Props = {
  steps: StartupStep[];
  isOwner: boolean;
  togglingIndex: number | null;
  onToggle: (index: number) => void;
};

export function StepTimeline({ steps, isOwner, togglingIndex, onToggle }: Props) {
  return (
    <div className="relative flex flex-col gap-4">
      {/* ligne verticale continue */}
      <div className="absolute bottom-4 left-[17px] top-4 w-px bg-border" aria-hidden />

      {steps.map((step, index) => {
        const status = getStepStatus(steps, index);
        const showDivider = status === "CURRENT";

        return (
          <div key={step.id} className="relative">
            {showDivider && (
              <div className="mb-4 border-t border-dashed border-brand-blue/50" aria-hidden />
            )}
            <StepRow
              step={step}
              index={index}
              steps={steps}
              isOwner={isOwner}
              isToggling={togglingIndex === index}
              onToggle={onToggle}
            />
          </div>
        );
      })}
    </div>
  );
}