"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { ComboBox } from "@/components/ui/ComboBox";
import { startupApi } from "@/features/projets/api/startuAPI";
import { mentorshipApi } from "@/features/mentorat/api/mentorshipAPI";
import type { Startup } from "../../../types/startupTypes";

interface RequestMentorshipModalProps {
  open: boolean;
  onClose: () => void;
  mentorId: string | null;
  mentorName?: string;
  requestedStartupIds?: string[];
  onSuccess?: () => void;
}

interface FormValues {
  startupId: string;
  message: string;
}

export function RequestMentorshipModal({
  open,
  onClose,
  mentorId,
  mentorName,
  requestedStartupIds = [],
  onSuccess,
}: RequestMentorshipModalProps) {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoadingStartups, setIsLoadingStartups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { startupId: "", message: "" },
  });

  const message = watch("message");

  // charge les startups de l'utilisateur à l'ouverture de la modal
  useEffect(() => {
    if (!open) return;
    reset({ startupId: "", message: "" });
    setIsLoadingStartups(true);
    startupApi
      .getMine()
      .then((res) => setStartups(res.data.startups))
      .catch(() => toast.error("Impossible de charger vos startups."))
      .finally(() => setIsLoadingStartups(false));
  }, [open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const submitHandler = async (values: FormValues) => {
    if (!mentorId) return;
    setIsSubmitting(true);
    try {
      await mentorshipApi.create({
        mentorId,
        startupId: values.startupId,
        message: values.message.trim(),
      });
      toast.success("Demande de mentorat envoyée.");
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(msg ?? "Erreur lors de l'envoi de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableStartups = startups.filter(
    (s) => !requestedStartupIds.includes(s.id),
  );
  const startupOptions = availableStartups.map((s) => s.name);
  const startupIdByName = (name: string) =>
    availableStartups.find((s) => s.name === name)?.id ?? "";
  const startupNameById = (id: string) =>
    availableStartups.find((s) => s.id === id)?.name ?? "";

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
            className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Demander un mentorat{mentorName ? ` à ${mentorName}` : ""}
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
                <Controller
                  control={control}
                  name="startupId"
                  rules={{ required: "Sélectionnez une startup" }}
                  render={({ field, fieldState }) => (
                    <ComboBox
                      label="Startup concernée"
                      placeholder={
                        isLoadingStartups
                          ? "Chargement..."
                          : "Sélectionner une startup"
                      }
                      options={startupOptions}
                      value={startupNameById(field.value)}
                      onChange={(name) => field.onChange(startupIdByName(name))}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                {availableStartups.length === 0 && !isLoadingStartups && (
                  <p className="text-xs text-muted-foreground">
                    {startups.length === 0
                      ? "Vous devez d'abord créer une startup avant de demander un mentorat."
                      : "Vous avez déjà envoyé une demande pour toutes vos startups à ce mentor."}
                  </p>
                )}
                {startups.length === 0 && !isLoadingStartups && (
                  <p className="text-xs text-muted-foreground">
                    Vous devez d&apos;abord créer une startup avant de demander
                    un mentorat.
                  </p>
                )}
                {errors.startupId && (
                  <p className="text-xs text-danger">
                    {errors.startupId.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-foreground"
                  >
                    Message
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {message.length}/500
                  </span>
                </div>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Présentez-vous et expliquez ce que vous attendez de ce mentorat..."
                  {...register("message", {
                    required: "Le message est requis",
                    minLength: {
                      value: 20,
                      message:
                        "Le message doit contenir au moins 20 caractères",
                    },
                    maxLength: {
                      value: 500,
                      message: "Le message ne peut pas dépasser 500 caractères",
                    },
                  })}
                  className="resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-rose"
                />
                {errors.message && (
                  <p className="text-xs text-danger">
                    {errors.message.message}
                  </p>
                )}
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
                  disabled={isSubmitting || availableStartups.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Envoyer la demande
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
