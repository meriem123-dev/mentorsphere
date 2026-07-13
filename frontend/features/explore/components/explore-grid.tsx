"use client";

import { MentorCard, type MentorCardData } from "./mentor-card";

export function ExploreGrid({ mentors }: { mentors: MentorCardData[] }) {
  if (mentors.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Aucun résultat pour ces critères. Essaie un autre secteur ou une autre recherche.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {mentors.map((mentor, i) => (
        <MentorCard key={mentor.id} mentor={mentor} index={i} />
      ))}
    </div>
  );
}