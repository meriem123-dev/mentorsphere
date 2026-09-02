"use client";
import { Users, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { RecommendedMentor } from "@/types/dashTypes";

interface RecommendedMentorsProps {
  mentors: RecommendedMentor[];
  onRegenerate: () => void;
  isGenerating: boolean;
  attemptsRemaining: number;
  onRequestMentorship: (
    mentorId: string,
    mentorName: string,
    requestedStartupIds: string[],
  ) => void;
}

export function RecommendedMentors({
  mentors,
  onRegenerate,
  isGenerating,
  attemptsRemaining,
  onRequestMentorship,
}: RecommendedMentorsProps) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5">
      <div className="mb-8 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Mentors Recommandés</h3>
      </div>

      {mentors.length === 0 && !isGenerating ? (
        <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
          Aucune recommandation pour l&apos;instant. Génère-en une pour ce
          mentorat.
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {mentors.map((mentor) => (
            <li
              key={mentor.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar user={mentor} accent={"rose"} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{mentor.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {mentor.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onRequestMentorship(
                    mentor.id,
                    mentor.name,
                    mentor.requestedStartupIds ?? [],
                  )
                }
                disabled={mentor.hasRequestedAll}
                className="shrink-0 rounded-full bg-brand-blue px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mentor.hasRequestedAll ? "Déjà demandé" : "Demander"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onRegenerate}
        disabled={isGenerating || attemptsRemaining === 0}
        className="mt-3 flex items-center gap-1.5 self-start text-sm font-medium text-brand-rose hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {mentors.length === 0 ? "Générer des recommandations" : "Régénérer"}
      </button>
    </div>
  );
}
