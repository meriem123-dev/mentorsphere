interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}


//composant barre de progression
export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-background h-1">
      <div
        className="bg-brand-rose h-1 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}