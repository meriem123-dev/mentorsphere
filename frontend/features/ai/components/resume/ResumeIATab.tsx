"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AIGenerateEmptyState } from "../AIGenerateEmptyState";
import { ResumeResultCard } from "./ResumeResultsCard";
import { fetchAISummary } from "../../api/aiAPI";
import type { AISummaryResult } from "../../../../types/aiTypes";

const COOLDOWN_MS = 60 * 60 * 1000;

interface ResumeIATabProps {
  startupName: string;
  mentorshipId: string;
}

export function ResumeIATab({ startupName, mentorshipId }: ResumeIATabProps) {
  const [result, setResult] = useState<AISummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);

   const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // au montage, on vérifie s'il existe déjà un résultat (cache ou premier calcul)
  useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      try {
        const data = await fetchAISummary(mentorshipId);
        if (!cancelled) setResult(data);
      } catch {
        // silencieux ici : l'état vide s'affichera, l'utilisateur pourra cliquer manuellement
      } finally {
        if (!cancelled) setHasCheckedCache(true);
      }
    };

    checkExisting();
    return () => {
      cancelled = true;
    };
  }, [mentorshipId]);

  // horloge locale pour le décompte du cooldown, sans lire Date.now() pendant le rendu
    useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }, []);
  
    const cooldownRemainingMs = generatedAt
      ? Math.max(0, COOLDOWN_MS - (now - new Date(generatedAt).getTime()))
      : 0;
    const isOnCooldown = cooldownRemainingMs > 0;
  
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAISummary(mentorshipId);
      setResult(data);
    } catch (error) {
      toast.error("Impossible de générer le résumé IA.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasCheckedCache) {
    return <p className="py-24 text-center text-sm text-muted-foreground">Chargement...</p>;
  }

  if (!result) {
    return (
      <AIGenerateEmptyState
        icon={Sparkles}
        title={`Résumé IA — ${startupName}`}
        description="Analyse des objectifs, tâches et sessions"
        ctaLabel="Générer le résumé IA"
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />
    );
  }

  const cooldownMinutes = Math.ceil(cooldownRemainingMs / 60000);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isOnCooldown
            ? `Prochaine génération possible dans ${cooldownMinutes} min`
            : "Résultats disponibles depuis plus d'une heure"}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || isOnCooldown}
          className="text-xs font-medium text-brand-rose disabled:cursor-not-allowed disabled:text-muted-foreground"
        >
          {isLoading ? "Génération..." : "Régénérer"}
        </button>
      </div>

      <ResumeResultCard result={result} />
    </div>
  );
}