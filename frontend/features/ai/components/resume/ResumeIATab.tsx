"use client";

import { useEffect, useState } from "react";
import { Sparkles,RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AIGenerateEmptyState } from "../AIGenerateEmptyState";
import { ResumeResultCard } from "./ResumeResultsCard";
import { fetchAISummaryState, generateAISummary } from "../../api/aiAPI";
import type { AISummaryResult } from "../../../../types/aiTypes";

interface ResumeIATabProps {
  startupName: string;
  mentorshipId: string;
}

export function ResumeIATab({ startupName, mentorshipId }: ResumeIATabProps) {
  const [result, setResult] = useState<AISummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [windowResetAt, setWindowResetAt] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      try {
        const state = await fetchAISummaryState(mentorshipId);
        if (!cancelled) {
          setResult(state.result);
          setAttemptsRemaining(state.attemptsRemaining);
          setWindowResetAt(state.windowResetAt);
        }
      } catch {
        // silencieux : l'état vide s'affichera
      } finally {
        if (!cancelled) setHasCheckedCache(true);
      }
    };

    checkExisting();
    return () => {
      cancelled = true;
    };
  }, [mentorshipId]);

  // horloge légère, utilisée uniquement pour réactiver le bouton après reset
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const limitReached = attemptsRemaining <= 0;
  const resetInMs = windowResetAt ? Math.max(0, new Date(windowResetAt).getTime() - now) : 0;
  const isBlocked = limitReached && resetInMs > 0;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const outcome = await generateAISummary(mentorshipId);
      setResult(outcome.result);
      setAttemptsRemaining(outcome.attemptsRemaining);
      setWindowResetAt(outcome.windowResetAt);
      if (outcome.limitReached) {
        toast.info("Limite de générations atteinte, réessayez plus tard.");
      }
    } catch (error) {
      toast.error( "Impossible de générer le résumé IA.");
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

  const resetMinutes = Math.ceil(resetInMs / 60000);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isBlocked
            ? `Limite atteinte — réessayez dans ${resetMinutes} min`
            : `${attemptsRemaining} génération${attemptsRemaining > 1 ? "s" : ""} restante${attemptsRemaining > 1 ? "s" : ""}`}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || isBlocked}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-1.5 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Regénérer
        </button>
      </div>

      <ResumeResultCard result={result} />
    </div>
  );
}