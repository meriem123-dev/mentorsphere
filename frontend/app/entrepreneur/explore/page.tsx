
"use client";

import { useEffect, useState } from "react";
import { ExploreSearchBar } from "@/features/explore/components/search-bar";
import { ExploreFilters } from "@/features/explore/components/explore-filters";
import { ExploreGrid } from "@/features/explore/components/explore-grid";
import { RequestMentorshipModal } from "@/features/explore/components/request-mentorship-modal";
import { mentorApi } from "@/features/explore/api/mentorAPI";
import type { MentorCardData } from "@/features/explore/components/mentor-card";
import type { Mentor } from "../../../types/mentorTypes";
import { EXPERTISE_DOMAINS, type ExpertiseDomain } from "@/lib/expertise";
import { Loader2 } from "lucide-react";

const FALLBACK_DOMAIN = (EXPERTISE_DOMAINS[0] ?? "SaaS") as ExpertiseDomain;

function mapMentorToCardData(mentor: Mentor): MentorCardData {
  const primaryDomain = mentor.domains[0]?.domain.name as ExpertiseDomain | undefined;
  const initials = `${mentor.user.firstName.charAt(0)}${mentor.user.lastName.charAt(0)}`.toUpperCase();

  return {
    id: mentor.id,
    name: `${mentor.user.firstName} ${mentor.user.lastName}`,
    title: mentor.profession ?? "Mentor",
    expertise: primaryDomain ?? FALLBACK_DOMAIN,
    rating: 5,
    menteeCount: mentor.mentorships.length,
    avatarUrl: mentor.user.profilePicture ?? undefined,
    initials,
  };
}

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sector, setSector] = useState("Tous");
  const [view, setView] = useState<"mentors" | "projets" | "entrepreneurs">("mentors");

  const [mentors, setMentors] = useState<MentorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<{ id: string; name: string } | null>(null);

  // debounce de la recherche
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  // fetch mentors à chaque changement de recherche/secteur
  useEffect(() => {
    if (view !== "mentors") return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await mentorApi.getMentors({
          search: debouncedSearch || undefined,
          domain: sector !== "Tous" ? sector : undefined,
        });
        if (!cancelled) setMentors(res.mentors.map(mapMentorToCardData));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, sector, view]);

  const handleRequestMentorship = (mentorId: string, mentorName: string) => {
    setSelectedMentor({ id: mentorId, name: mentorName });
    setRequestModalOpen(true);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <ExploreSearchBar value={search} onChange={setSearch} />
      <ExploreFilters expertise={sector} onExpertiseChange={setSector} view={view} onViewChange={setView} />

      {view === "mentors" ? (
        isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ExploreGrid mentors={mentors} onRequestMentorship={handleRequestMentorship} />
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Cette vue arrive bientôt.
        </div>
      )}

      <RequestMentorshipModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        mentorId={selectedMentor?.id ?? null}
        mentorName={selectedMentor?.name}
      />
    </div>
  );
}