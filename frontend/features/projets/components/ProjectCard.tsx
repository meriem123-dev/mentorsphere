"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  UserPlus,
  Check
} from "lucide-react";

export type ProjectStage = "Idée" | "MVP" | "Seed" | "Croissance";

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  stage: ProjectStage;
  domain: string;
  isRecruiting?: boolean;
  roadmapProgress: number;
  roadmapStepsCompleted: number;
  roadmapStepsTotal: number;
  needs?: string[];
  hasSentRequest?: boolean;
}

const STAGE_STYLES: Record<ProjectStage, string> = {
  Idée: "bg-brand-rose/10 text-brand-rose border-brand-rose/20",
  MVP: "bg-warning/10 text-warning border-warning/20",
  Seed: "bg-info/10 text-info border-info/20",
  Croissance: "bg-success/10 text-success border-success/20",
};

interface ProjectCardProps {
  project: ProjectData;
  variant?: "owner" | "explore";
  onViewRoadmap: (id: string) => void;
  onJoin?: (id: string) => void;
  onOpenDetails?: (id: string) => void;
  onViewNeed?: (id: string, need: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  hasSentRequest?: boolean;
}

//cmpst card
export function ProjectCard({
  project,
  variant = "owner",
  onViewRoadmap,
  onJoin,
  onOpenDetails,
  onViewNeed,
  onEdit,
  onDelete,
  hasSentRequest,
}: ProjectCardProps) {
  const initial = project.name.trim().charAt(0).toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canManage = variant === "owner" && (onEdit || onDelete);
  const showJoinButton = variant === "explore" && project.isRecruiting;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={() => onOpenDetails?.(project.id)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-base font-semibold text-white">
              {initial}
            </div>
            <h3 className="font-semibold text-foreground">{project.name}</h3>
          </div>

          {canManage && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                aria-label="Options du projet"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                  >
                    {onEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onEdit(project.id);
                        }}
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onDelete(project.id);
                        }}
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STAGE_STYLES[project.stage]}`}
          >
            {project.stage}
          </span>
          <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {project.domain}
          </span>
          {project.isRecruiting && (
            <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              Recrute
            </span>
          )}
        </div>

        {project.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Roadmap</span>
            <span className="font-medium text-foreground">
              {project.roadmapProgress}% · {project.roadmapStepsCompleted}/
              {project.roadmapStepsTotal} étapes
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-brand"
              initial={{ width: 0 }}
              animate={{ width: `${project.roadmapProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/20 px-5 py-3">
        {showJoinButton ? (
          hasSentRequest ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              <Check className="h-3.5 w-3.5" />
              Demande envoyée
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onJoin?.(project.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Rejoindre
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewRoadmap(project.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98]"
          >
            <Map className="h-3.5 w-3.5" />
            Voir la roadmap
          </button>
        )}

        {project.needs?.map((need) => (
          <button
            key={need}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewNeed?.(project.id, need);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-sm font-medium text-success transition-colors hover:bg-success/15"
          >
            <Users className="h-3.5 w-3.5" />
            {need}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
