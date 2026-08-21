"use client";

import { useEffect, useState } from "react";
import { Hexagon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AIGenerateEmptyState } from "../AIGenerateEmptyState";
import { MentorMatchCard } from "./MentorMatchCard";
import { fetchMentorMatches } from "../../api/aiAPI";
import type { MentorMatch } from "../../../../types/aiTypes";

const COOLDOWN_MS = 60 * 60 * 1000;

export function RecommandationMentorsTab({
  startupName,
  mentorshipId,
}: {
  startupName: string;
  mentorshipId: string;
}) {
  const router = useRouter();
  const [matches, setMatches] = useState<MentorMatch[] | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      try {
        const data = await fetchMentorMatches(mentorshipId);
        if (!cancelled) {
          setMatches(data.matches);
          setGeneratedAt(data.generatedAt);
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
      const data = await fetchMentorMatches(mentorshipId);
      setMatches(data.matches);
      setGeneratedAt(data.generatedAt);
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