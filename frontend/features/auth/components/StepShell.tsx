import ProgressBar from "@/components/ui/ProgressBar";
import StepHeader from "./StepHeader";
import { LucideIcon } from "lucide-react";

interface StepShellProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  stepLabel?: string;
  icon?: LucideIcon;
  emoji?: string;
  children: React.ReactNode;
}


//progressbar + step header
export default function StepShell({
  currentStep,
  totalSteps,
  title,
  stepLabel,
  icon,
  emoji,
  children,
}: StepShellProps) {
  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden w-full max-w-xl mx-auto">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="p-6 sm:p-8">
        <StepHeader
          icon={icon}
          emoji={emoji}
          title={title}
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabel={stepLabel}
        />

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}