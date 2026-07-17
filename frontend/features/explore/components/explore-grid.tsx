"use client";

import { MentorCard, type MentorCardData } from "./mentor-card";
import { EntrepreneurCard, type EntrepreneurCardData } from "./EntrepreneurCard";

interface ExploreGridProps {
  view: "mentors" | "entrepreneurs";
  mentors?: MentorCardData[];
  entrepreneurs?: EntrepreneurCardData[];
  onRequestMentorship?: (mentorId: string, mentorName: string) => void;
  onViewProfile?: (entrepreneurId: string) => void;
}

export function ExploreGrid({
  view,
  mentors = [],
  entrepreneurs = [],
  onRequestMentorship,
  onViewProfile,
}: ExploreGridProps) {
  const isEmpty =
    view === "mentors" ? mentors.length === 0 : entrepreneurs.length === 0;

  if (isEmpty) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Aucun résultat pour ces critères. Essaie un autre secteur ou une autre recherche.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {view === "mentors"
        ? mentors.map((mentor, i) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              index={i}
              onRequestMentorship={onRequestMentorship}
            />
          ))
        : entrepreneurs.map((entrepreneur, i) => (
            <EntrepreneurCard
              key={entrepreneur.id}
              entrepreneur={entrepreneur}
              index={i}
              onViewProfile={onViewProfile}
            />
          ))}
    </div>
  );
}