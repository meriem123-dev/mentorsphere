import { LucideIcon } from "lucide-react";

interface StepHeaderProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
}


//cmpst header étapes
export default function StepHeader({
  icon: Icon,
  emoji,
  title,
  currentStep,
  totalSteps,
  stepLabel,
}: StepHeaderProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        {emoji ? (
          <span className="text-4xl">{emoji}</span>
        ) : Icon ? (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="text-primary" size={24} />
          </div>
        ) : null}
      </div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground text-sm mt-2">
        Étape {currentStep} sur {totalSteps}
        {stepLabel ? ` — ${stepLabel}` : ""}
      </p>
    </div>
  );
}