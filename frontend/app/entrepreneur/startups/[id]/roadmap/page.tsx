"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Check,
  Lock,
  Globe,
  Users,
} from "lucide-react";
import { startupApi } from "@/features/projets/api/startuAPI";
import type { Startup, StartupStep } from "@/types/startupTypes";
import type { ProjectStage } from "@/features/projets/components/ProjectCard";
import { confirmToast } from "@/lib/confirm";
import { toast } from "sonner";

const STAGE_LABELS: Record<Startup["stage"], ProjectStage> = {
  IDEE: "Idée",
  MVP: "MVP",
  SEED: "Seed",
  CROISSANCE: "Croissance",
};

const STAGE_STYLES: Record<ProjectStage, string> = {
  Idée: "bg-brand-rose/10 text-brand-rose border-brand-rose/20",
  MVP: "bg-warning/10 text-warning border-warning/20",
  Seed: "bg-info/10 text-info border-info/20",
  Croissance: "bg-success/10 text-success border-success/20",
};

const MAX_STEPS = 12;

export default function ProjectRoadmapPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stepInput, setStepInput] = useState("");

 

//charger les startups
  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const res = await startupApi.getById(params.id);
        if (ignore) return;
        setStartup(res.data.startup);
        setIsOwner(res.data.isOwner);
      } catch {
        if (!ignore) setNotFound(true);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [params.id]);

  //envoie le tableau complet des steps au back (pattern delete+recreate déjà utilisé par la modal)
  const persistSteps = async (steps: StartupStep[]) => {
    if (!startup) return;
    setIsSaving(true);
    try {
      const res = await startupApi.update(startup.id, {
        roadmapSteps: steps.map((s) => ({
          title: s.title,
          completed: s.completed,
        })),
      });
      setStartup(res.data.startup);
    } catch {
      toast.error("Impossible d'enregistrer la modification.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStep = (stepId: string) => {
    if (!startup || !isOwner) return;
    const updated = startup.steps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s,
    );
    setStartup({ ...startup, steps: updated });
    persistSteps(updated);
  };

  const addStep = () => {
    if (!startup || !isOwner) return;
    const value = stepInput.trim();
    if (!value || startup.steps.length >= MAX_STEPS) return;
    if (
      startup.steps.some((s) => s.title.toLowerCase() === value.toLowerCase())
    )
      return;

    const updated: StartupStep[] = [
      ...startup.steps,
      {
        id: `temp-${Date.now()}`,
        title: value,
        completed: false,
        order: startup.steps.length,
      },
    ];
    setStartup({ ...startup, steps: updated });
    setStepInput("");
    persistSteps(updated);
  };

  const removeStep = async (stepId: string) => {
    if (!startup || !isOwner) return;
    const confirmed = await confirmToast({
      title: "Supprimer cette étape ?",
      description: "Cette action est irréversible.",
      confirmLabel: "Supprimer",
    });
    if (!confirmed) return;

    const updated = startup.steps.filter((s) => s.id !== stepId);
    setStartup({ ...startup, steps: updated });
    persistSteps(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !startup) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center">
        <p className="font-medium text-foreground">Projet introuvable</p>
        <p className="text-sm text-muted-foreground">
          Ce projet n&apos;existe pas ou n&apos;est plus accessible.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </button>
      </div>
    );
  }

  const stage = STAGE_LABELS[startup.stage];
  const total = startup.steps.length;
  const completed = startup.steps.filter((s) => s.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </button>

      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {startup.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {startup.description}
            </p>
          </div>
          {startup.isPublic ? (
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STAGE_STYLES[stage]}`}
          >
            {stage}
          </span>
          <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {startup.domain}
          </span>
          {startup.isRecruiting && (
            <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              Recrute
            </span>
          )}
        </div>

        {startup.needs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {startup.needs.map((need) => (
              <span
                key={need}
                className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
              >
                <Users className="h-3 w-3" />
                {need}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium text-foreground">
            {progress}% · {completed}/{total} étapes
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-brand"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {startup.steps.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucune étape pour le moment.
          </p>
        ) : (
          startup.steps.map((step, index) =>
            isOwner ? (
              <div
                key={step.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  disabled={isSaving}
                  aria-pressed={step.completed}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    step.completed
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground hover:bg-brand-blue/10 hover:text-brand-blue"
                  }`}
                >
                  {step.completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </button>
                <span
                  className={`flex-1 text-sm transition-colors ${
                    step.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {step.title}
                </span>
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  aria-label="Supprimer l'étape"
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                key={step.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    step.completed
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`flex-1 text-sm ${
                    step.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ),
          )
        )}
      </div>

      {isOwner && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addStep();
                }
              }}
              placeholder="Ajouter une étape..."
              disabled={startup.steps.length >= MAX_STEPS}
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-rose disabled:opacity-50"
            />
            <button
              type="button"
              onClick={addStep}
              disabled={startup.steps.length >= MAX_STEPS}
              className="flex items-center justify-center rounded-xl border border-border px-3.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            {startup.steps.length}/{MAX_STEPS} étapes
          </span>
        </div>
      )}
    </div>
  );
}
