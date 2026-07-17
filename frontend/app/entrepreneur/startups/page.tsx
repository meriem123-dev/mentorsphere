"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import {
  ProjectsTabs,
  type ProjectsView,
} from "@/features/projets/components/ProjectTabs";
import { ProjectsGrid } from "@/features/projets/components/ProjectsGrid";
import type {
  ProjectData,
  ProjectStage,
} from "@/features/projets/components/ProjectCard";
import {
  CreateStartupModal,
  type CreateStartupFormValues,
} from "@/features/projets/components/CreateStartupModal";
import { startupApi } from "@/features/projets/api/startuAPI";
import type { Startup } from "../../../types/startupTypes";
import { confirmToast } from "@/lib/confirm";
import { toast } from "sonner";
import { ProjectDetailsModal } from "@/features/projets/components/ProjectDetailsModal";
import { JoinRequestModal } from "@/features/projets/components/JoinRequestModal";
import axios from "axios";

//traduit l'enum Prisma (ASCII) vers le libellé français utilisé par le front
const STAGE_LABELS: Record<Startup["stage"], ProjectStage> = {
  IDEE: "Idée",
  MVP: "MVP",
  SEED: "Seed",
  CROISSANCE: "Croissance",
};

// convertit une Startup (backend) en valeurs de formulaire pour l'édition
function mapStartupToFormValues(startup: Startup): CreateStartupFormValues {
  return {
    name: startup.name,
    description: startup.description,
    stage: STAGE_LABELS[startup.stage],
    domain: startup.domain,
    isPublic: startup.isPublic,
    isRecruiting: startup.isRecruiting,
    needs: startup.needs ?? [],
    roadmapSteps: startup.steps.map((s) => ({
      title: s.title,
      completed: s.completed,
    })),
  };
}

function mapStartupToProjectData(startup: Startup): ProjectData {
  const total = startup.steps.length;
  const completed = startup.steps.filter((s) => s.completed).length;
  return {
    id: startup.id,
    name: startup.name,
    description: startup.description,
    stage: STAGE_LABELS[startup.stage],
    domain: startup.domain,
    isRecruiting: startup.isRecruiting,
    roadmapProgress: total > 0 ? Math.round((completed / total) * 100) : 0,
    roadmapStepsCompleted: completed,
    roadmapStepsTotal: total,
    needs: startup.needs,
    hasSentRequest: startup.joinRequestStatus === "PENDING",
  };
}

//page
export default function MyProjectsPage() {
  const router = useRouter();

  const [view, setView] = useState<ProjectsView>("mine");
  const [startups, setStartups] = useState<Startup[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);
  const [publicProjects, setPublicProjects] = useState<ProjectData[]>([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [hasLoadedPublic, setHasLoadedPublic] = useState(false);
  const [detailsProjectId, setDetailsProjectId] = useState<string | null>(null);
  const [joinModalProjectId, setJoinModalProjectId] = useState<string | null>(
    null,
  );
  const [sentJoinRequests, setSentJoinRequests] = useState<Set<string>>(
    new Set(),
  );

  //appel api et chargement
  const fetchProjects = async () => {
    try {
      const res = await startupApi.getMine();
      setStartups(res.data.startups);
      setProjects(res.data.startups.map(mapStartupToProjectData));
    } finally {
      setIsLoading(false);
    }
  };

  //rendering
  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await startupApi.getMine();
        if (ignore) return;
        setStartups(res.data.startups);
        setProjects(res.data.startups.map(mapStartupToProjectData));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (view !== "explore" || hasLoadedPublic) return;

    let ignore = false;

    const load = async () => {
      setIsLoadingPublic(true);
      try {
        const res = await startupApi.getPublic();
        if (!ignore) {
          setPublicProjects(res.data.startups.map(mapStartupToProjectData));
          setHasLoadedPublic(true);
        }
      } finally {
        if (!ignore) setIsLoadingPublic(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [view, hasLoadedPublic]);

  //gérer création + modification (même modal)
  const handleSubmitModal = async (values: CreateStartupFormValues) => {
    if (editingStartup) {
      await startupApi.update(editingStartup.id, values);
    } else {
      await startupApi.create(values);
    }
    setIsLoading(true);
    await fetchProjects();
  };

  //gérer affichage roadmap
  const handleViewRoadmap = (id: string) => {
    router.push(`/entrepreneur/startups/${id}/roadmap`);
  };

  //gérer delete
  const handleDeleteStartup = async (id: string) => {
    const confirmed = await confirmToast({
      title: "Supprimer cette startup ?",
      description: "Cette action est irréversible.",
      confirmLabel: "Supprimer",
    });
    if (!confirmed) return;

    await startupApi.remove(id);
    await fetchProjects();
    toast.success("Startup supprimée.");
  };

  //gérer ouverture modal en mode édition
  const handleEditStartup = (id: string) => {
    const startup = startups.find((s) => s.id === id);
    if (!startup) return;
    setEditingStartup(startup);
    setIsModalOpen(true);
  };

  //gérer ouverture modal en mode création
  const handleOpenCreateModal = () => {
    setEditingStartup(null);
    setIsModalOpen(true);
  };

  //gérer fermeture modal (reset du mode édition)
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingStartup(null);
  };

  //ouvrir la modale de demande pour rejoindre
  const handleOpenJoinModal = (id: string) => {
    setJoinModalProjectId(id);
  };

  //confirmer l'envoi de la demande (avec message)
  const handleConfirmJoin = async (message: string) => {
    if (!joinModalProjectId) return;
    try {
      await startupApi.join(joinModalProjectId, message || undefined);
      setSentJoinRequests((prev) => new Set(prev).add(joinModalProjectId));
      toast.success("Demande envoyée au fondateur.");
    } catch (error: unknown) {
      const msg = axios.isAxiosError<{ message?: string }>(error)
        ? (error.response?.data?.message ??
          "Impossible d'envoyer la demande pour le moment.")
        : "Impossible d'envoyer la demande pour le moment.";
      toast.error(msg);
    }
  };

  const detailsProject =
    view === "mine"
      ? (projects.find((p) => p.id === detailsProjectId) ?? null)
      : (publicProjects.find((p) => p.id === detailsProjectId) ?? null);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Mes Projets
          </h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} startup{projects.length > 1 ? "s" : ""} créée
            {projects.length > 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 self-start rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Créer une Startup
        </button>
      </header>

      <ProjectsTabs view={view} onViewChange={setView} />

      {view === "mine" ? (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ProjectsGrid
              projects={projects}
              onViewRoadmap={handleViewRoadmap}
              onCreateProject={handleOpenCreateModal}
              onEdit={handleEditStartup}
              onDelete={handleDeleteStartup}
              onOpenDetails={setDetailsProjectId}
              sentJoinRequests={sentJoinRequests}
            />
          )}

          <CreateStartupModal
            open={isModalOpen}
            onClose={handleModalClose}
            onSubmit={handleSubmitModal}
            mode={editingStartup ? "edit" : "create"}
            initialValues={
              editingStartup
                ? mapStartupToFormValues(editingStartup)
                : undefined
            }
          />
        </>
      ) : (
        <>
          {isLoadingPublic ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ProjectsGrid
              projects={publicProjects}
              variant="explore"
              onViewRoadmap={handleViewRoadmap}
              onJoin={handleOpenJoinModal}
              onOpenDetails={setDetailsProjectId}
              sentJoinRequests={sentJoinRequests}
            />
          )}
        </>
      )}

      <ProjectDetailsModal
        project={detailsProject}
        variant={view === "mine" ? "owner" : "explore"}
        onClose={() => setDetailsProjectId(null)}
        onViewRoadmap={(id) => {
          setDetailsProjectId(null);
          handleViewRoadmap(id);
        }}
        onJoin={(id) => {
          setDetailsProjectId(null);
          handleOpenJoinModal(id);
        }}
        hasSentRequest={
          !!detailsProject &&
          (detailsProject.hasSentRequest ||
            sentJoinRequests.has(detailsProject.id))
        }
      />

      <JoinRequestModal
        open={joinModalProjectId !== null}
        projectName={
          publicProjects.find((p) => p.id === joinModalProjectId)?.name ?? ""
        }
        onClose={() => setJoinModalProjectId(null)}
        onSubmit={handleConfirmJoin}
      />
    </div>
  );
}
