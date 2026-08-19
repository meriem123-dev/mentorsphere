"use client";

import { FileText, Video, Link2, Bookmark, Trash2 } from "lucide-react";
import type { Resource } from "../../../types/resourceTypes";
import { confirmToast } from "@/lib/confirm";

interface ResourceCardProps {
  resource: Resource;
  onToggleSave?: (id: string) => void;
  onOpen?: (resource: Resource) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

const TYPE_CONFIG = {
  document: {
    icon: FileText,
    iconBg: "bg-muted",
    iconColor: "text-brand-rose-light",
    badgeLabel: "doc",
    actionLabel: "Consulter",
  },
  video: {
    icon: Video,
    iconBg: "bg-muted",
    iconColor: "text-foreground",
    badgeLabel: "vidéo",
    actionLabel: "Regarder",
  },
  link: {
    icon: Link2,
    iconBg: "bg-muted",
    iconColor: "text-brand-blue-light",
    badgeLabel: "lien",
    actionLabel: "Ouvrir",
  },
} as const;

export function ResourceCard({
  resource,
  onToggleSave,
  onOpen,
  onDelete,
  currentUserId,
}: ResourceCardProps) {
  const config = TYPE_CONFIG[resource.type];
  const Icon = config.icon;
  const canDelete = !currentUserId || resource.authorId === currentUserId;

  async function handleDelete() {
    const confirmed = await confirmToast({
      title: "Supprimer cette ressource ?",
      description: "Cette action est irréversible.",
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;
    onDelete?.(resource.id);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.iconBg}`}
        >
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleSave?.(resource.id)}
            aria-label={
              resource.isSaved ? "Retirer des enregistrements" : "Enregistrer"
            }
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Bookmark
              className="h-4 w-4"
              fill={resource.isSaved ? "currentColor" : "none"}
            />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Supprimer la ressource"
              className="text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
          {resource.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          par {resource.authorName} · {resource.date}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {config.badgeLabel}
        </span>
        <span className="text-xs text-muted-foreground">{resource.meta}</span>
      </div>

      <button
        type="button"
        onClick={() => onOpen?.(resource)}
        className="mt-1 rounded-2xl bg-gradient-brand px-3 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
      >
        {config.actionLabel}
      </button>
    </div>
  );
}
