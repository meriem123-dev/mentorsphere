"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { ResourceCard } from "./ResourceCard";
import { AddResourceModal } from "./AddResourceModal";
import { resourcesApi } from "../api/resourcesAPI";
import type {
  Resource,
  ResourceType,
  RawResourceFromApi,
} from "../../../types/resourceTypes";
import { useAuth } from "../../../context/AuthContext";

type FilterValue = "all" | ResourceType;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "document", label: "Documents" },
  { value: "video", label: "Vidéos" },
  { value: "link", label: "Liens" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

//mappage
function mapApiResourceToUi(raw: RawResourceFromApi): Resource {
  const type = raw.type.toLowerCase() as ResourceType;

  let meta = "";
  if (type === "document" && raw.sizeBytes) {
    const ext = raw.fileName?.split(".").pop()?.toUpperCase() ?? "FICHIER";
    meta = `${(raw.sizeBytes / (1024 * 1024)).toFixed(1)} MB · ${ext}`;
  } else if (type === "video") {
    meta = raw.durationLabel ?? "";
  } else if (type === "link" && raw.url) {
    try {
      meta = new URL(raw.url).hostname.replace("www.", "");
    } catch {
      meta = raw.url;
    }
  }

  return {
    id: raw.id,
    type,
    title: raw.title,
    authorId: raw.author.id,
    authorName: `${raw.author.firstName} ${raw.author.lastName}`,
    date: formatDate(raw.createdAt),
    meta,
    isSaved: raw.isSaved,
    ...(raw.url && { url: raw.url }),
    ...(raw.fileUrl && { fileUrl: raw.fileUrl }),
  };
}

interface ResourcesTabProps {
  onOpenResource?: (resource: Resource) => void;
}

export function ResourcesTab({ onOpenResource }: ResourcesTabProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const { user } = useAuth();

  //charger ressources
  useEffect(() => {
    let cancelled = false;

    async function fetchResources() {
      try {
        setIsLoading(true);
        const { data } = await resourcesApi.list({ limit: 100 });
        if (!cancelled) {
          setResources(data.resources.map(mapApiResourceToUi));
        }
      } catch (err) {
        if (!cancelled) {
          toast.error("Impossible de charger les ressources.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchResources();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(
    () => ({
      total: resources.length,
      document: resources.filter((r) => r.type === "document").length,
      video: resources.filter((r) => r.type === "video").length,
      link: resources.filter((r) => r.type === "link").length,
      saved: resources.filter((r) => r.isSaved).length,
    }),
    [resources],
  );

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesFilter =
        activeFilter === "all" || resource.type === activeFilter;
      const matchesSearch = resource.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesSaved = !showSavedOnly || resource.isSaved;
      return matchesFilter && matchesSearch && matchesSaved;
    });
  }, [resources, activeFilter, search, showSavedOnly]);

  //gérer save
  async function toggleSave(id: string) {
    const previous = resources;
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSaved: !r.isSaved } : r)),
    );

    try {
      await resourcesApi.toggleSave(id);
    } catch (err) {
      setResources(previous);
      toast.error("Impossible d'enregistrer la ressource.");
    }
  }

  //gérer ajout
  async function handleAddResource(data: {
    type: ResourceType;
    title: string;
    url: string;
    file?: File;
  }) {
    try {
      const formData = new FormData();
      formData.append("type", data.type.toUpperCase());
      formData.append("title", data.title);
      if (data.url) formData.append("url", data.url);
      if (data.file) formData.append("file", data.file);

      const { data: created } = await resourcesApi.create(formData);
      setResources((prev) => [mapApiResourceToUi(created), ...prev]);
      toast.success("Ressource ajoutée.");
    } catch (err) {
      toast.error("Impossible d'ajouter la ressource.");
      throw err;
    }
  }

  //gérer supp
  async function handleDelete(id: string) {
    const previous = resources;
    setResources((prev) => prev.filter((r) => r.id !== id));

    try {
      await resourcesApi.remove(id);
    } catch (err) {
      setResources(previous);
      toast.error("Impossible de supprimer la ressource.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard
          label="Total"
          value={counts.total}
          valueColor="text-brand-rose"
        />
        <StatCard
          label="Documents"
          value={counts.document}
          valueColor="text-brand-blue"
        />
        <StatCard
          label="Vidéos"
          value={counts.video}
          valueColor="text-brand-blue-light"
        />
        <StatCard
          label="Liens"
          value={counts.link}
          valueColor="text-brand-blue"
        />
        <StatCard
          label="Enregistrés"
          value={counts.saved}
          valueColor="text-brand-rose"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            const count =
              filter.value === "all"
                ? counts.total
                : counts[filter.value as keyof typeof counts];
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
                <span
                  className={
                    isActive ? "text-white/80" : "text-muted-foreground"
                  }
                >
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
          className="flex items-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Ajouter une ressource
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Chargement des ressources...
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onToggleSave={toggleSave}
              onOpen={onOpenResource}
              onDelete={handleDelete}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowSavedOnly((prev) => !prev)}
        className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white shadow-lg hover:opacity-90 cursor-pointer ${
          showSavedOnly ? "bg-brand-blue" : "bg-brand-rose"
        }`}
      >
        <Bookmark className="h-4 w-4" fill="currentColor" />
        {showSavedOnly ? "Toutes les ressources" : "Enregistrements"}
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
