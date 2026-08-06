"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Objective, ObjectiveCategory } from "@/types/workspaceTypes";
import { ComboBox } from "@/components/ui/ComboBox";

export const OBJECTIVE_CATEGORIES: ObjectiveCategory[] = [
  "Vision & stratégie",
  "Étude de marché",
  "Validation du besoin",
  "Développement produit",
  "Expérience utilisateur",
  "Modèle économique",
  "Marketing & croissance",
  "Ventes",
  "Finance",
  "Levée de fonds",
  "Préparation investisseurs",
  "Juridique",
  "Opérations",
  "Leadership",
  "Équipe",
  "Technologie",
  "Réseau & partenariats",
  "Développement personnel",
];

export type ObjectiveFormData = {
  title: string;
  category: ObjectiveCategory;
  progress: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Objective;
  onSubmit: (data: ObjectiveFormData) => Promise<void>;
};

export function ObjectiveModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<ObjectiveFormData>({
    defaultValues: {
      title: initialData?.title ?? "",
      category: initialData?.category ?? OBJECTIVE_CATEGORIES[0],
      progress: initialData?.progress ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title ?? "",
        category: initialData?.category ?? OBJECTIVE_CATEGORIES[0],
        progress: initialData?.progress ?? 0,
      });
    }
  }, [open, initialData, reset]);

  const progress = watch("progress");

  const submit = async (data: ObjectiveFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch {
      toast.error(
        mode === "create"
          ? "Impossible de créer l'objectif"
          : "Impossible de modifier l'objectif",
      );
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {mode === "create" ? "Nouvel objectif" : "Modifier l'objectif"}
            </h2>
            <Dialog.Close
              nativeButton={false}
              render={<div className="..." role="button" />}
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-s font-medium text-muted-foreground">
                Titre
              </label>
              <input
                {...register("title", { required: "Le titre est requis" })}
                placeholder="Ex: Valider le product-market fit"
                className="w-full rounded-xl bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue"
              />
              {errors.title && (
                <p className="text-xs text-brand-rose">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <ComboBox
                    {...field}
                    label="Catégorie"
                    options={OBJECTIVE_CATEGORIES}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Progression
                </label>
                <span className="text-xs font-medium text-foreground">
                  {progress}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                {...register("progress", { valueAsNumber: true })}
                className="w-full accent-brand-rose"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-hero px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {mode === "create" ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
