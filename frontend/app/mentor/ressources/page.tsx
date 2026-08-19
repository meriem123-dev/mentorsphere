"use client";

import { ResourcesTab } from "@/features/resources/components/ResourcesTab";
import type { Resource } from "@/types/resourceTypes";

export default function RessourcesPage() {
  function handleOpenResource(resource: Resource) {
    if (resource.type === "link" && resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (resource.type === "video" && resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (resource.type === "document" && resource.fileUrl) {
      window.open(resource.fileUrl, "_blank", "noopener,noreferrer");
      return;
    }
    console.warn("Aucune URL disponible pour cette ressource:", resource);
  }

  return (
    <div className="p-6">
      <ResourcesTab onOpenResource={handleOpenResource} />
    </div>
  );
}
