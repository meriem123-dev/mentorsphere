"use client";

import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  onGenerate: () => void;
  isLoading?: boolean;
};

export function AIGenerateEmptyState({ icon: Icon, title, description, ctaLabel, onGenerate, isLoading }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand">
        <Icon className="h-7 w-7 text-white" strokeWidth={2} />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="rounded-xl bg-gradient-brand cursor-pointer px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isLoading ? "Génération en cours..." : ctaLabel}
      </button>
    </div>
  );
}