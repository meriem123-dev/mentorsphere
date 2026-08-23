"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Microscope, ShieldAlert, ShieldCheck, TrendingUp,RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AIGenerateEmptyState } from "../AIGenerateEmptyState";
import { fetchSwotAnalysisState, generateSwotAnalysis } from "../../api/aiAPI";
import type { SwotAnalysisResult } from "../../../../types/aiTypes";

interface AnalyseApprofondieTabProps {
  startupName: string;
  mentorshipId: string;
}

interface SwotQuadrantConfig {
  key: keyof Pick<SwotAnalysisResult, "forces" | "faiblesses" | "opportunites" | "menaces">;
  label: string;
  icon: typeof ShieldCheck;
  border: string;
  bg: string;
  text: string;
}

const QUADRANTS: SwotQuadrantConfig[] = [
  {
    key: "forces",
    label: "Forces",
    icon: ShieldCheck,
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    key: "faiblesses",
    label: "Faiblesses",
    icon: ShieldAlert,
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  {
    key: "opportunites",
    label: "Opportunités",
    icon: TrendingUp,
    border: "border-sky-200",
    bg: "bg-sky-50",
    text: "text-sky-700",
  },
  {
    key: "menaces",
    label: "Menaces",
    icon: ShieldAlert,
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
];

export function AnalyseApprofondieTab({ startupName, mentorshipId }: AnalyseApprofondieTabProps) {
  const [result, setResult] = useState<SwotAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [windowResetAt, setWindowResetAt] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      try {
        const state = await fetchSwotAnalysisState(mentorshipId);
        if (!cancelled) {
          setResult(state.result);
          setAttemptsRemaining(state.attemptsRemaining);
          setWindowResetAt(state.windowResetAt);
        }
      } catch {
        // silencieux : l'état vide s'affichera, l'utilisateur pourra cliquer manuellement
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
      const outcome = await generateSwotAnalysis(mentorshipId);
      setResult(outcome.result);
      setAttemptsRemaining(outcome.attemptsRemaining);
      setWindowResetAt(outcome.windowResetAt);
      if (outcome.limitReached) {
        toast.info("Limite de générations atteinte, réessayez plus tard.");
      }
    } catch (error) {
      toast.error("Impossible de générer l'analyse approfondie.")
      ;
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
        icon={Microscope}
        title={`Analyse approfondie — ${startupName}`}
        description="Analyse détaillée du projet, des risques et des opportunités"
        ctaLabel="Lancer l'analyse approfondie"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUADRANTS.map(({ key, label, icon: Icon, border, bg, text }) => (
          <div key={key} className={`rounded-2xl border ${border} ${bg} p-5`}>
            <div className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${text}`}>
              <Icon className="h-4 w-4" />
              {label}
            </div>
            <ul className="space-y-2">
              {result[key].length === 0 ? (
                <li className="text-sm text-muted-foreground">Aucun point identifié</li>
              ) : (
                result[key].map((point, i) => (
                  <li key={i} className={`text-sm ${text}`}>
                    {point}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
          <Lightbulb className="h-4 w-4" />
          Insight IA
        </div>
        <p className="text-sm text-violet-900">{result.insight || "Aucun insight disponible."}</p>
      </div>
    </div>
  );
}