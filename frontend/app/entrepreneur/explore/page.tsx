"use client";

import { useEffect, useState } from "react";
import { ExploreSearchBar } from "@/features/explore/components/search-bar";
import { ExploreFilters } from "@/features/explore/components/explore-filters";
import { ExploreGrid } from "@/features/explore/components/explore-grid";
import { RequestMentorshipModal } from "@/features/explore/components/request-mentorship-modal";
import { mentorApi } from "@/features/explore/api/mentorAPI";
import type { MentorCardData } from "@/features/explore/components/mentor-card";
import type { EntrepreneurCardData } from "@/features/explore/components/EntrepreneurCard";
import type { Mentor } from "../../../types/mentorTypes";
import type { Entrepreneur } from "../../../types/entrepreneurTypes";
import { EXPERTISE_DOMAINS, type ExpertiseDomain } from "@/lib/expertise";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const FALLBACK_DOMAIN = (EXPERTISE_DOMAINS[0] ?? "SaaS") as ExpertiseDomain;

function mapMentorToCardData(mentor: Mentor): MentorCardData {
  const primaryDomain = mentor.domains[0]?.domain.name as
    | ExpertiseDomain
    | undefined;
  const initials =
    `${mentor.user.firstName.charAt(0)}${mentor.user.lastName.charAt(0)}`.toUpperCase();

  return {
    id: mentor.id,
    name: `${mentor.user.firstName} ${mentor.user.lastName}`,
    title: mentor.profession ?? "Mentor",
    expertise: primaryDomain ?? FALLBACK_DOMAIN,
    rating: 5,
    menteeCount: mentor.mentorships.length,
    avatarUrl: mentor.user.profilePicture ?? undefined,
    initials,
    mentorshipStatus: mentor.mentorshipStatus ?? null,
  };
}

function mapEntrepreneurToCardData(entrepreneur: Entrepreneur): EntrepreneurCardData {
  const primaryDomain = entrepreneur.domains[0]?.domain.name as
    | ExpertiseDomain
    | undefined;
  const initials =
    `${entrepreneur.user.firstName.charAt(0)}${entrepreneur.user.lastName.charAt(0)}`.toUpperCase();

  return {
    id: entrepreneur.id,
    name: `${entrepreneur.user.firstName} ${entrepreneur.user.lastName}`,
    title: entrepreneur.profession ?? "Entrepreneur",
    expertise: primaryDomain ?? FALLBACK_DOMAIN,
    lookingFor: entrepreneur.lookingFor,
    avatarUrl: entrepreneur.user.profilePicture ?? undefined,
    initials,
    
  };
}

export default function ExplorePage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sector, setSector] = useState("Tous");

  const [mentors, setMentors] = useState<MentorCardData[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<EntrepreneurCardData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [view, setView] = useState<"mentors" | "entrepreneurs">("mentors");

  // debounce de la recherche
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  // fetch mentors ou entrepreneurs selon la vue active
 useEffect(() => {
  let ignore = false;

  const load = async () => {
    setIsLoading(true);
    try {
      const domainParam = sector !== "Tous" ? sector : undefined;

      if (view === "mentors") {
        const res = await mentorApi.getMentors({
          domain: domainParam,
          search: debouncedSearch || undefined,
        });
        if (!ignore) setMentors(res.mentors.map(mapMentorToCardData));
      } else {
        const res = await mentorApi.getEntrepreneurs({
          domain: domainParam,
          search: debouncedSearch || undefined,
        });
        if (!ignore)
          setEntrepreneurs(res.entrepreneurs.map(mapEntrepreneurToCardData));
      }
    } catch (error) {
      console.error("Explore fetch error:", error);
      if (!ignore) {
        setMentors([]);
        setEntrepreneurs([]);
      }
    } finally {
      if (!ignore) setIsLoading(false);
    }
  };

  load();

  return () => {
    ignore = true;
  };
}, [view, sector, debouncedSearch]);

  const handleRequestMentorship = (mentorId: string, mentorName: string) => {
    setSelectedMentor({ id: mentorId, name: mentorName });
    setRequestModalOpen(true);
  };

  const handleViewProfile = (entrepreneurId: string) => {
    router.push(`/entrepreneur/explore/entrepreneurs/${entrepreneurId}`);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <ExploreSearchBar value={search} onChange={setSearch} />
      <ExploreFilters
        expertise={sector}
        onExpertiseChange={setSector}
        view={view}
        onViewChange={setView}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ExploreGrid
          view={view}
          mentors={mentors}
          entrepreneurs={entrepreneurs}
          onRequestMentorship={handleRequestMentorship}
          onViewProfile={handleViewProfile}
        />
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
