"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Plus,
  Lock,
  Globe,
  Loader2,
  ChevronUp,
  ChevronDown,
  Map,
  Check,
} from "lucide-react";
import type { ProjectStage } from "./ProjectCard";
import { ComboBox } from "@/components/ui/ComboBox";

const STAGES: ProjectStage[] = ["Idée", "MVP", "Seed", "Croissance"];

const DOMAINS = [
  "Intelligence Artificielle",
  "FinTech",
  "HealthTech",
  "EdTech",
  "GreenTech",
  "Cybersecurity",
  "Blockchain & Web3",
  "SaaS",
  "Marketplace",
  "E-commerce",
  "AgriTech",
  "FoodTech",
  "PropTech",
  "Logistique",
  "TravelTech",
  "SportTech",
  "FashionTech",
  "LegalTech",
  "HRTech",
  "Media & Creator Economy",
  "Gaming",
  "IoT",
  "Biotech",
];

// Suggestions rapides pour démarrer une roadmap
const STEP_SUGGESTIONS = [
  "Étude de marché",
  "Prototype",
  "MVP",
  "Premiers utilisateurs",
  "Levée de fonds",
  "Lancement public",
];

const MAX_STEPS = 12;

export interface CreateStartupFormValues {
  name: string;
  description: string;
  stage: ProjectStage;
  domain: string;
  isPublic: boolean;
  isRecruiting: boolean;
  needs: string[];
  roadmapSteps: { title: string; completed: boolean }[];
}

interface CreateStartupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateStartupFormValues) => Promise<void> | void;
  mode?: "create" | "edit";
  initialValues?: CreateStartupFormValues;
}

//cmpst
export function CreateStartupModal({
  open,
  onClose,
  onSubmit,
  mode = "create",
  initialValues,
}: CreateStartupModalProps) {
  const [needInput, setNeedInput] = useState("");
  const [stepInput, setStepInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: CreateStartupFormValues = {
    name: "",
    description: "",
    stage: "Idée",
    domain: "",
    isPublic: true,
    isRecruiting: false,
    needs: [],
    roadmapSteps: [],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateStartupFormValues>({
    defaultValues,
  });

  // Pré-remplit le formulaire quand on ouvre la modal en mode édition
  useEffect(() => {
    if (open) {
      reset(mode === "edit" && initialValues ? initialValues : defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialValues]);

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
    move: moveStep,
  } = useFieldArray({ control, name: "roadmapSteps" });

  const needs = watch("needs");
  const description = watch("description");
  const watchedSteps = watch("roadmapSteps");
  const completedStepsCount = watchedSteps.filter((s) => s.completed).length;
  const progressPercent =
    watchedSteps.length > 0
      ? Math.round((completedStepsCount / watchedSteps.length) * 100)
      : 0;

  const addNeed = () => {
    const value = needInput.trim();
    if (!value || needs.includes(value) || needs.length >= 6) return;
    setValue("needs", [...needs, value]);
    setNeedInput("");
  };

  const removeNeed = (need: string) => {
    setValue(
      "needs",
      needs.filter((n) => n !== need),
    );
  };

  const addStep = (title?: string) => {
    const value = (title ?? stepInput).trim();
    if (!value || stepFields.length >= MAX_STEPS) return;
    if (
      stepFields.some(
        (step) => step.title.toLowerCase() === value.toLowerCase(),
      )
    )
      return;
    appendStep({ title: value, completed: false });
    if (!title) setStepInput("");
  };

  const handleClose = () => {
    reset();
    setNeedInput("");
    setStepInput("");
    onClose();
  };

  const submitHandler = async (values: CreateStartupFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {mode === "edit" ? "Modifier la startup" : "Créer une startup"}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(submitHandler)}
              className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Nom du projet
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ex: EcoDelivery"
                  {...register("name", {
                    required: "Le nom est requis",
                    minLength: {
                      value: 3,
                      message: "Le nom doit contenir au moins 3 caractères",
                    },
                    maxLength: {
                      value: 60,
                      message: "Le nom ne peut pas dépasser 60 caractères",
                    },
                  })}
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-rose"
                />
                {errors.name && (
                  <p className="text-xs text-danger">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-foreground"
                  >
                    Description
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {description.length}/500
                  </span>
                </div>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Décrivez votre idée, le problème résolu et votre vision..."
                  {...register("description", {
                    required: "La description est requise",
                    minLength: {
                      value: 20,
                      message:
                        "La description doit contenir au moins 20 caractères",
                    },
                    maxLength: {
                      value: 500,
                      message:
                        "La description ne peut pas dépasser 500 caractères",
                    },
                  })}
                  className="resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-rose"
                />
                {errors.description && (
                  <p className="text-xs text-danger">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Controller
                    control={control}
                    name="stage"
                    render={({ field }) => (
                      <ComboBox
                        label="Étape"
                        options={STAGES}
                        value={field.value}
                        onChange={field.onChange}
                        searchable={false}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Controller
                    control={control}
                    name="domain"
                    rules={{ required: "Sélectionnez un domaine" }}
                    render={({ field, fieldState }) => (
                      <ComboBox
                        label="Domaine"
                        placeholder="Sélectionner"
                        options={DOMAINS}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  {errors.domain && (
                    <p className="text-xs text-danger">
                      {errors.domain.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="needs"
                  className="text-sm font-medium text-foreground"
                >
                  Besoins du projet
                </label>
                <div className="flex gap-2">
                  <input
                    id="needs"
                    type="text"
                    value={needInput}
                    onChange={(e) => setNeedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNeed();
                      }
                    }}
                    placeholder="Ex: Développeur, Investisseur..."
                    className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-rose"
                  />
                  <button
                    type="button"
                    onClick={addNeed}
                    className="flex items-center justify-center rounded-xl border border-border px-3.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {needs.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {needs.map((need) => (
                      <span
                        key={need}
                        className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                      >
                        {need}
                        <button
                          type="button"
                          onClick={() => removeNeed(need)}
                          className="rounded-full hover:bg-success/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Étapes initiales de la roadmap */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="roadmapStep"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground"
                  >
                    <Map className="h-3.5 w-3.5 text-muted-foreground" />
                    Étapes de la roadmap
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {stepFields.length}/{MAX_STEPS}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    id="roadmapStep"
                    type="text"
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addStep();
                      }
                    }}
                    placeholder="Ex: Valider l'idée, Construire le MVP..."
                    className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-rose"
                  />
                  <button
                    type="button"
                    onClick={() => addStep()}
                    className="flex items-center justify-center rounded-xl border border-border px-3.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Suggestions rapides, masquées une fois ajoutées */}
                <div className="flex flex-wrap gap-1.5">
                  {STEP_SUGGESTIONS.filter(
                    (s) =>
                      !stepFields.some(
                        (f) => f.title.toLowerCase() === s.toLowerCase(),
                      ),
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addStep(suggestion)}
                      disabled={stepFields.length >= MAX_STEPS}
                      className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-brand-blue hover:text-brand-blue disabled:opacity-50"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>

                {stepFields.length > 0 && (
                  <>
                    <div className="mt-1">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Progression initiale
                        </span>
                        <span className="font-medium text-foreground">
                          {progressPercent}% · {completedStepsCount}/
                          {watchedSteps.length}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-gradient-brand"
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="mt-1 flex flex-col gap-1.5">
                      {stepFields.map((field, index) => (
                        <Controller
                          key={field.id}
                          control={control}
                          name={`roadmapSteps.${index}.completed`}
                          render={({ field: completedField }) => (
                            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                              <button
                                type="button"
                                onClick={() =>
                                  completedField.onChange(!completedField.value)
                                }
                                aria-pressed={completedField.value}
                                aria-label={
                                  completedField.value
                                    ? `Marquer l'étape "${field.title}" comme non terminée`
                                    : `Marquer l'étape "${field.title}" comme terminée`
                                }
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                                  completedField.value
                                    ? "bg-success text-white"
                                    : "bg-muted text-muted-foreground hover:bg-brand-blue/10 hover:text-brand-blue"
                                }`}
                              >
                                {completedField.value ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  index + 1
                                )}
                              </button>
                              <span
                                className={`flex-1 truncate text-sm transition-colors ${
                                  completedField.value
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground"
                                }`}
                              >
                                {field.title}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => moveStep(index, index - 1)}
                                  aria-label="Monter l'étape"
                                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === stepFields.length - 1}
                                  onClick={() => moveStep(index, index + 1)}
                                  aria-label="Descendre l'étape"
                                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeStep(index)}
                                  aria-label="Supprimer l'étape"
                                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                <p className="text-xs text-muted-foreground">
                  Optionnel — cochez une étape déjà accomplie pour démarrer avec
                  une progression réelle. Vous pourrez aussi en ajouter plus
                  tard depuis la roadmap du projet.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <Controller
                  control={control}
                  name="isPublic"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {field.value ? (
                          <Globe className="h-4 w-4  text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {field.value ? "Projet public" : "Projet privé"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {field.value
                              ? "Visible dans l'exploration des projets"
                              : "Visible uniquement par vous et vos mentors"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          field.value ? "bg-gradient-brand" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute -left-0.5  top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            field.value ? "translate-x-6.5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                />

                <Controller
                  control={control}
                  name="isRecruiting"
                  render={({ field }) => (
                    <div className="flex items-center justify-between border-t border-border/60 pt-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Recrutement ouvert
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Afficher le badge Recrute sur la carte du projet
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          field.value ? "bg-gradient-brand" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute -left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            field.value ? "translate-x-6.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {isSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  {mode === "edit" ? "Enregistrer" : "Créer la startup"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
