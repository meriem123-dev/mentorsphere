"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Minus,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchMentorBriefingState,
  generateMentorBriefing,
} from "../../api/aiAPI";
import type {
  AIGenerationOutcome,
  AIGenerationState,
  MentorBriefingResult,
} from "@/types/aiTypes";
import { AIGenerateEmptyState } from "../AIGenerateEmptyState";

interface MentorBriefingTabProps {
  mentorshipId: string;
  startupName: string;
}

function useCountdown(resetAt: string | null) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!resetAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [resetAt]);

  if (!resetAt) return null;
  const remainingMs = new Date(resetAt).getTime() - now;
  if (remainingMs <= 0) return null;

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

type KeyEvolutionTrend = "positive" | "negative" | "neutral";

function trendColor(trend: KeyEvolutionTrend) {
  if (trend === "positive") return "text-success";
  if (trend === "negative") return "text-brand-rose";
  return "text-gray-500";
}

function TrendIcon({ trend }: { trend: KeyEvolutionTrend }) {
  const className = `h-3.5 w-3.5 ${trendColor(trend)}`;
  if (trend === "positive") return <TrendingUp className={className} />;
  if (trend === "negative") return <TrendingDown className={className} />;
  return <Minus className={className} />;
}

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export function MentorBriefingTab({ mentorshipId, startupName }: MentorBriefingTabProps) {
  const [state, setState] =
    useState<AIGenerationState<MentorBriefingResult> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const countdown = useCountdown(state?.windowResetAt ?? null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchMentorBriefingState(mentorshipId);
        if (!cancelled) setState(data);
      } catch (err) {
        if (!cancelled) toast.error("erreur lors du chargement");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mentorshipId]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const outcome: AIGenerationOutcome<MentorBriefingResult> =
        await generateMentorBriefing(mentorshipId);
      setState(outcome);
      if (outcome.limitReached) {
        toast.info(
          "Limite de génération atteinte pour cette heure. Réessayez plus tard.",
        );
      }
    } catch (err) {
      toast.error("erreur");
    } finally {
      setIsGenerating(false);
    }
  }, [mentorshipId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-foreground/60">
        Chargement de la synthèse…
      </div>
    );
  }

  const briefing = state?.result ?? null;
  const canGenerate = (state?.attemptsRemaining ?? 0) > 0 && !isGenerating;

  if (!briefing) {
    return (
      <AIGenerateEmptyState
        icon={Sparkles}
        title={`Préparation Session — ${startupName}`}
        description="Préparez votre prochaine session et passez à l'action"
        ctaLabel="Lancer"
        onGenerate={handleGenerate}
        isLoading={isGenerating}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground/50">
          {state?.attemptsRemaining ?? 0} génération(s) restante(s) cette heure
          {countdown ? ` · réinitialisation dans ${countdown}` : ""}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-1.5 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`}
          />
          Régénérer
        </button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="space-y-4"
      >
        <motion.section
          variants={cardVariants}
          className="rounded-2xl bg-card px-6 py-5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-blue">
            Synthèse · {briefing.periodLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {briefing.summary}
          </p>
        </motion.section>

        <motion.section
          variants={cardVariants}
          className="rounded-2xl bg-brand-navy px-6 py-5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-rose">
            Évolutions clés
          </p>
          <div className="mt-3 divide-y divide-white/5">
            {briefing.keyEvolutions.map((evolution) => (
              <div
                key={evolution.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="text-white">{evolution.label}</span>
                <span
                  className={`flex items-center gap-1.5 font-mono text-sm ${trendColor(evolution.trend)}`}
                >
                  <TrendIcon trend={evolution.trend} />
                  {evolution.value}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={cardVariants}
          className="rounded-2xl bg-brand-navy px-6 py-5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-rose">
            Agenda suggéré
          </p>
          <ol className="mt-3 space-y-3">
            {briefing.suggestedAgenda.map((item, index) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                <span className="font-mono text-xs text-brand-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-white">
                  {item.title}{" "}
                  <span className="text-gray-500">
                    ({item.durationMinutes} min)
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </motion.section>

        <p className="flex items-center gap-1.5 text-[11px] text-foreground/30">
          <Clock className="h-3 w-3" />
          Généré le{" "}
          {new Date(briefing.generatedAt).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      </motion.div>
    </div>
  );
}