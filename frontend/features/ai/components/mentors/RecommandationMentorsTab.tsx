"use client";

import { useEffect, useState } from "react";
import { Hexagon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AIGenerateEmptyState } from "../AIGenerateEmptyState";
import { MentorMatchCard } from "./MentorMatchCard";
import { fetchMentorMatchesState, generateMentorMatches } from "../../api/aiAPI";
import type { MentorMatch, MentorMatchesResult } from "../../../../types/aiTypes";

export function RecommandationMentorsTab({
  startupName,
  mentorshipId,
}: {
  startupName: string;
  mentorshipId: string;
}) {
  const router = useRouter();
  const [matches, setMatches] = useState<MentorMatch[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [windowResetAt, setWindowResetAt] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      try {
        const state = await fetchMentorMatchesState(mentorshipId);
        if (!cancelled) {
          setMatches(state.result?.matches ?? null);
          setAttemptsRemaining(state.attemptsRemaining);
          setWindowResetAt(state.windowResetAt);
        }
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
      const outcome = await generateMentorMatches(mentorshipId);
      setMatches((outcome.result as MentorMatchesResult).matches);
      setAttemptsRemaining(outcome.attemptsRemaining);
      setWindowResetAt(outcome.windowResetAt);
      if (outcome.limitReached) {
        toast.info("Limite de générations atteinte, réessayez plus tard.");
      }
    } catch (error) {
      toast.error("Impossible de générer les recommandations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (mentorId: string) => {
    router.push(`/profil/mentor/${mentorId}`);
  };

  if (!hasCheckedCache) {
    return <p className="py-24 text-center text-sm text-muted-foreground">Chargement...</p>;
  }

  if (!matches) {
    return (
      <AIGenerateEmptyState
        icon={Hexagon}
        title="Recommandations mentors"
        description={`Matching sémantique basé sur le profil de ${startupName}`}
        ctaLabel="Trouver les meilleurs mentors"
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
          className="text-xs font-medium text-brand-rose disabled:cursor-not-allowed disabled:text-muted-foreground cursor-pointer"
        >
          {isLoading ? "Génération..." : "Régénérer"}
        </button>
      </div>

      {[...matches]
        .sort((a, b) => b.matchScore - a.matchScore)
        .map((mentor, index) => (
          <MentorMatchCard
            key={mentor.id}
            mentor={mentor}
            index={index}
            onViewProfile={handleViewProfile}
          />
        ))}
    </div>
  );
}