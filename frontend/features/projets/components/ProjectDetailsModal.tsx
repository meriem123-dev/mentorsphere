"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Map, Users, UserPlus,Check } from "lucide-react";
import type { ProjectData, ProjectStage } from "./ProjectCard";

const STAGE_STYLES: Record<ProjectStage, string> = {
  Idée: "bg-brand-rose/10 text-brand-rose border-brand-rose/20",
  MVP: "bg-warning/10 text-warning border-warning/20",
  Seed: "bg-info/10 text-info border-info/20",
  Croissance: "bg-success/10 text-success border-success/20",
};

interface ProjectDetailsModalProps {
  project: ProjectData | null;
  variant?: "owner" | "explore";
  onClose: () => void;
  onViewRoadmap: (id: string) => void;
  onJoin?: (id: string) => void;
  hasSentRequest?: boolean;
}

//cmpst modale
export function ProjectDetailsModal({
  project,
  variant = "owner",
  onClose,
  onViewRoadmap,
  onJoin,
  hasSentRequest,
}: ProjectDetailsModalProps) {
  const showJoinButton = variant === "explore" && project?.isRecruiting;

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
          >
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-base font-semibold text-white">
                  {project.name.trim().charAt(0).toUpperCase()}
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {project.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
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
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Roadmap</span>
                  <span className="font-medium text-foreground">
                    {project.roadmapProgress}% · {project.roadmapStepsCompleted}
                    /{project.roadmapStepsTotal} étapes
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-brand"
                    initial={{ width: 0 }}
                    animate={{ width: `${project.roadmapProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>

              {project.needs && project.needs.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Besoins
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.needs.map((need) => (
                      <span
                        key={need}
                        className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                      >
                        <Users className="h-3 w-3" />
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              {showJoinButton ? (
                hasSentRequest ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-5 py-2 text-sm font-medium text-muted-foreground">
                    <Check className="h-3.5 w-3.5" />
                    Demande envoyée
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJoin?.(project.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98]"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Rejoindre
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => onViewRoadmap(project.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98]"
                >
                  <Map className="h-3.5 w-3.5" />
                  Voir la roadmap
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
