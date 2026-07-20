"use client";

import { useEffect, useState } from "react";
import { ExploreSearchBar } from "@/features/explore/components/search-bar";
import { ExploreFilters } from "@/features/explore/components/explore-filters";
import { ExploreGrid } from "@/features/explore/components/explore-grid";
import { RequestMentorshipModal } from "@/features/explore/components/request-mentorship-modal";
import { mentorApi } from "@/features/explore/api/mentorAPI";
import type { MentorCardData } from "@/features/explore/components/mentor-card";
import type { EntrepreneurCardData } from "@/features/explore/components/EntrepreneurCard";
import { startupApi } from "@/features/projets/api/startuAPI";
import type { Startup } from "../../../types/startupTypes";
import type { Mentor } from "../../../types/mentorTypes";
import type { Entrepreneur } from "../../../types/entrepreneurTypes";
import { EXPERTISE_DOMAINS, type ExpertiseDomain } from "@/lib/expertise";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const FALLBACK_DOMAIN = (EXPERTISE_DOMAINS[0] ?? "SaaS") as ExpertiseDomain;

function mapMentorToCardData(
  mentor: Mentor,
  myStartupIds: string[],
): MentorCardData {
  const primaryDomain = mentor.domains[0]?.domain.name as
    | ExpertiseDomain
    | undefined;
  const initials =
    `${mentor.user.firstName.charAt(0)}${mentor.user.lastName.charAt(0)}`.toUpperCase();

  const requestedStartupIds = new Set(
    (mentor.myMentorshipRequests ?? []).map((r) => r.startupId),
  );
  const sentCount = requestedStartupIds.size;
  const hasRequestedAll =
    myStartupIds.length > 0 &&
    myStartupIds.every((id) => requestedStartupIds.has(id));

  return {
    id: mentor.id,
    name: `${mentor.user.firstName} ${mentor.user.lastName}`,
    title: mentor.profession ?? "Mentor",
    expertise: primaryDomain ?? FALLBACK_DOMAIN,
    rating: 5,
    menteeCount: mentor.mentorships.length,
    avatarUrl: mentor.user.profilePicture ?? undefined,
    initials,
    sentRequestsCount: sentCount,
    hasRequestedAll,
    requestedStartupIds: Array.from(requestedStartupIds) as string[],
  };
}
function mapEntrepreneurToCardData(
  entrepreneur: Entrepreneur,
): EntrepreneurCardData {
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
  const [view, setView] = useState<"mentors" | "entrepreneurs">("mentors");
  const [myStartups, setMyStartups] = useState<Startup[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<{
    id: string;
    name: string;
    requestedStartupIds: string[];
  } | null>(null);

  // debounce de la recherche
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  // fetch mentors ou entrepreneurs selon la vue active
  const loadMentors = async () => {
    setIsLoading(true);
    try {
      const domainParam = sector !== "Tous" ? sector : undefined;
      const res = await mentorApi.getMentors({
        domain: domainParam,
        search: debouncedSearch || undefined,
      });
      setMentors(
        res.mentors.map((m) =>
          mapMentorToCardData(
            m,
            myStartups.map((s) => s.id),
          ),
        ),
      );
    } catch (error) {
      console.error("Explore fetch error:", error);
      setMentors([]);
    } finally {
      setIsLoading(false);
    }
  };

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
          if (!ignore)
            setMentors(
              res.mentors.map((m) =>
                mapMentorToCardData(
                  m,
                  myStartups.map((s) => s.id),
                ),
              ),
            );
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
  }, [view, sector, debouncedSearch, myStartups]);

  //chargement startups
  useEffect(() => {
    let ignore = false;
    startupApi
      .getMine()
      .then((res) => {
        if (!ignore) setMyStartups(res.data.startups);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const handleViewMentorProfile = (mentorId: string) => {
    router.push(`/profil/mentor/${mentorId}`);
  };

  const handleViewEntrepreneurProfile = (entrepreneurId: string) => {
    router.push(`/profil/entrepreneur/${entrepreneurId}`);
  };

  const handleRequestMentorship = (mentorId: string, mentorName: string) => {
    const mentor = mentors.find((m) => m.id === mentorId);
    setSelectedMentor({
      id: mentorId,
      name: mentorName,
      requestedStartupIds: mentor?.requestedStartupIds ?? [],
    });
    setRequestModalOpen(true);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-2">
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
          onViewMentorProfile={handleViewMentorProfile}
          onViewEntrepreneurProfile={handleViewEntrepreneurProfile}
        />
      )}

      <RequestMentorshipModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        mentorId={selectedMentor?.id ?? null}
        mentorName={selectedMentor?.name}
        requestedStartupIds={selectedMentor?.requestedStartupIds ?? []}
        onSuccess={loadMentors}
      />
    </div>
  );
}
