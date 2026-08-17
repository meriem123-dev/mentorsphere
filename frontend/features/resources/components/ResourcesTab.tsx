"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Bookmark } from "lucide-react";
import { ResourceCard } from "./ResourceCard";
import { AddResourceModal } from "./AddResourceModal";
import type { Resource, ResourceType } from "../../../types/resourceTypes";

///data
const MOCK_RESOURCES: Resource[] = [
  { id: "1", type: "document", title: "Business Model Canvas", authorName: "Sarah", date: "14 août", meta: "2.4 MB · PDF", isSaved: false },
  { id: "2", type: "video", title: "How to Build a Pitch Deck", authorName: "Ahmed", date: "12 août", meta: "18 min", isSaved: false },
  { id: "3", type: "link", title: "YC Startup Library", authorName: "Sarah", date: "10 août", meta: "ycombinator.com", isSaved: false },
  { id: "4", type: "document", title: "Playbook SaaS B2B Pricing", authorName: "Sarah Chen", date: "9 août", meta: "24 pages · PDF", isSaved: false },
  { id: "5", type: "video", title: "Maîtriser le pitch VC", authorName: "Marcus Reid", date: "8 août", meta: "42 min", isSaved: false },
  { id: "6", type: "link", title: "First Round Capital Review", authorName: "James Wu", date: "7 août", meta: "firstround.com", isSaved: false },
  { id: "7", type: "document", title: "Checklist Légale Startup", authorName: "James Wu", date: "5 août", meta: "12 pages · PDF", isSaved: false },
  { id: "8", type: "video", title: "Construire un Business Model", authorName: "Sarah Chen", date: "3 août", meta: "28 min", isSaved: false },
];

type FilterValue = "all" | ResourceType;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "document", label: "Documents" },
  { value: "video", label: "Vidéos" },
  { value: "link", label: "Liens" },
];

interface ResourcesTabProps {
  onOpenResource?: (resource: Resource) => void;
}

export function ResourcesTab({ onOpenResource }: ResourcesTabProps) {
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const counts = useMemo(
    () => ({
      total: resources.length,
      document: resources.filter((r) => r.type === "document").length,
      video: resources.filter((r) => r.type === "video").length,
      link: resources.filter((r) => r.type === "link").length,
      saved: resources.filter((r) => r.isSaved).length,
    }),
    [resources]
  );

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesFilter = activeFilter === "all" || resource.type === activeFilter;
      const matchesSearch = resource.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [resources, activeFilter, search]);

  function toggleSave(id: string) {
    
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSaved: !r.isSaved } : r))
    );
  }

  function handleAddResource(data: { type: ResourceType; title: string; authorName: string; url: string }) {
    
    const newResource: Resource = {
      id: crypto.randomUUID(),
      type: data.type,
      title: data.title,
      authorName: data.authorName,
      date: "aujourd'hui",
      meta: data.type === "link" ? data.url : "",
      isSaved: false,
      url: data.url,
    };
    setResources((prev) => [newResource, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={counts.total} valueColor="text-brand-rose"/>
        <StatCard label="Documents" value={counts.document} valueColor="text-brand-blue"/>
        <StatCard label="Vidéos" value={counts.video} valueColor="text-brand-blue-light"/>
        <StatCard label="Liens" value={counts.link} valueColor="text-brand-blue" />
        <StatCard label="Enregistrés" value={counts.saved} valueColor="text-brand-rose" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            const count =
              filter.value === "all" ? counts.total : counts[filter.value as keyof typeof counts];
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? "bg-gradient-brand text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {filter.label}
                <span className={isActive ? "text-white/80" : "text-muted-foreground"}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une ressource..."
            className="w-full rounded-lg bg-muted py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Ajouter une ressource
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onToggleSave={toggleSave}
            onOpen={onOpenResource}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setActiveFilter("all")}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-brand-rose px-4 py-3 text-sm font-medium text-white shadow-lg hover:opacity-90"
      >
        <Bookmark className="h-4 w-4" fill="currentColor" />
        Enregistrements
      </button>

      <AddResourceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddResource}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor = "text-foreground",
}: {
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}