"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MenteesToolbar } from "@/features/mentee/components/MenteeToolBar";
import { MenteesGrid } from "@/features/mentee/components/MenteesGrid";
import { menteeApi, type MenteeApiResponse } from "@/features/mentee/api/menteeAPI";
import type { Mentee, MenteeStatus, SortKey } from "@/types/mentoratTypes";
import { Loader2 } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  IDEE: "Idée",
  MVP: "MVP",
  SEED: "Seed",
  CROISSANCE: "Croissance",
};

function formatLastInteraction(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Il y a 1j";
  if (diffDays < 30) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR");
}

function mapToMentee(raw: MenteeApiResponse, index: number): Mentee {
  const { user } = raw.entrepreneur;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return {
    id: raw.mentorshipId,
    entrepreneurId: raw.entrepreneur.id,
    name: `${user.firstName} ${user.lastName}`,
    initials,
    avatarUrl: user.profilePicture,
    accent: index % 2 === 0 ? "rose" : "blue",
    projectName: raw.startup?.name ?? "Sans projet",
    stage: raw.startup ? (STAGE_LABELS[raw.startup.stage] ?? raw.startup.stage) : "—",
    status: user.isActive ? "actif" : "inactif", 
    lastSeenLabel: formatLastInteraction(raw.lastInteractionAt),
    sessionsCount: raw.sessionsCount, 
    progression: raw.progression,
  };
}

export default function MenteesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MenteeStatus | "tous">("tous");
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await menteeApi.getMentees();
        if (!ignore) setMentees(res.mentees.map(mapToMentee));
      } catch (error) {
        console.error("getMentees error:", error);
        if (!ignore) setMentees([]);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredMentees = useMemo(() => {
    let result = mentees.filter((mentee) => {
      const matchesSearch =
        mentee.name.toLowerCase().includes(search.toLowerCase()) ||
        mentee.projectName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "tous" || mentee.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      if (sortKey === "progression") return b.progression - a.progression;
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [mentees, search, statusFilter, sortKey]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Mes mentorés</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivez la progression des entrepreneurs que vous accompagnez.
        </p>
      </div>

      <MenteesToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
        resultCount={filteredMentees.length}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MenteesGrid
          mentees={filteredMentees}
          onOpenMentee={(mentee) => {
            // TODO: router.push vers l'espace de mentorat 
            console.log("Ouvrir l'espace de", mentee.name);
          }}
          onViewProfile={(entrepreneurId) => router.push(`/profil/entrepreneur/${entrepreneurId}`)}
        />
      )}
    </div>
  );
}