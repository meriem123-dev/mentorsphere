"use client";

import { useState } from "react";
import { ExploreSearchBar } from "@/features/explore/components/search-bar";
import { ExploreFilters } from "@/features/explore/components/explore-filters";
import { ExploreGrid } from "@/features/explore/components/explore-grid";
import type { MentorCardData } from "@/features/explore/components/mentor-card";

const MOCK_MENTORS: MentorCardData[] = [
  { id: "1", name: "Sarah Chen", title: "Ex-Google PM", expertise: "Développement produit", rating: 1.5, menteeCount: 32, initials: "SC" },
  { id: "2", name: "Marcus Reid", title: "Serial Founder", expertise: "Levée de fonds", rating: 4.8, menteeCount: 47, initials: "MR" },
  { id: "3", name: "Aisha Patel", title: "VC Partner", expertise: "Finance", rating: 5, menteeCount: 28, initials: "AP" },
  { id: "4", name: "James Wu", title: "YC Alumnus", expertise: "Stratégie & Business", rating: 4.7, menteeCount: 61, initials: "JW" },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("Tous");
  const [view, setView] = useState<"mentors" | "projets" | "entrepreneurs">("mentors");

  const filtered = MOCK_MENTORS.filter((m) => {
    const matchesSector = sector === "Tous" || m.expertise === sector;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <ExploreSearchBar value={search} onChange={setSearch} />
      <ExploreFilters expertise={sector} onExpertiseChange={setSector} view={view} onViewChange={setView} />
      <ExploreGrid mentors={filtered} />
    </div>
  );
}