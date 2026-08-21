"use client";

import { useState } from "react";
import { Microscope } from "lucide-react";
import { AIGenerateEmptyState } from "../AIGenerateEmptyState";

export function AnalyseApprofondieTab({ startupName }: { startupName: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
 
    setTimeout(() => setIsLoading(false), 900);
  };

  return (
    <AIGenerateEmptyState
      icon={Microscope}
      title={`Analyse approfondie — ${startupName}`}
      description="Analyse détaillée du projet, des risques et des opportunités"
      ctaLabel="Lancer l'analyse approfondie"
      onGenerate={handleGenerate}
      isLoading={isLoading}
    />
  );
}