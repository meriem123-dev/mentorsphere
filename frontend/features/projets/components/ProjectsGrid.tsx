"use client";

import { motion } from "framer-motion";
import { Rocket, Compass } from "lucide-react";
import { ProjectCard, type ProjectData } from "./ProjectCard";

interface ProjectsGridProps {
  projects: ProjectData[];
  /** "owner" = mes projets (édition), "explore" = projets publics (découverte) */
  variant?: "owner" | "explore";
  onViewRoadmap: (id: string) => void;
  onJoin?: (id: string) => void;
  onViewNeed?: (id: string, need: string) => void;
  onCreateProject?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpenDetails?: (id: string) => void;
  sentJoinRequests?: Set<string>;
}

export function ProjectsGrid({
  projects,
  variant = "owner",
  onViewRoadmap,
  onJoin,
  onViewNeed,
  onCreateProject,
  onEdit,
  onDelete,
  onOpenDetails,
  sentJoinRequests,
}: ProjectsGridProps) {
  if (projects.length === 0) {
    const isExplore = variant === "explore";

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-white">
          {isExplore ? (
            <Compass className="h-5 w-5" />
          ) : (
            <Rocket className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">
            {isExplore
              ? "Aucun projet public pour le moment"
              : "Aucune startup pour le moment"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isExplore
              ? "Revenez plus tard pour découvrir des projets à rejoindre."
              : "Créez votre première startup pour démarrer votre parcours."}
          </p>
        </div>
        {!isExplore && onCreateProject && (
          <button
            type="button"
            onClick={onCreateProject}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white"
          >
            Créer une startup
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          variant={variant}
          onViewRoadmap={onViewRoadmap}
          onJoin={onJoin}
          onViewNeed={onViewNeed}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenDetails={onOpenDetails}
          hasSentRequest={
            project.hasSentRequest ||
            (sentJoinRequests?.has(project.id) ?? false)
          }
        />
      ))}
    </div>
  );
}
