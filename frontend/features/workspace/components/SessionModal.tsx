"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import { workspaceApi } from "../api/workspaceAPI";
import type { CreateSessionPayload } from "../../../types/workspaceTypes";
import type { WorkspaceMember } from "../../../types/workspaceTypes";

type FormValues = {
  scheduledAt: string;
  durationMinutes: number;
  agenda: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorshipId: string;
  members: WorkspaceMember[];
  currentUserId: string;
  onCreated: (
    session: Awaited<ReturnType<typeof workspaceApi.createSession>>,
  ) => void;
};

//la modal
export function SessionModal({
  open,
  onOpenChange,
  mentorshipId,
  members,
  currentUserId,
  onCreated,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentMember = members.find((m) => m.userId === currentUserId);
  const canCreateSession =
    currentMember?.role === "owner" || currentMember?.role === "mentor";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { durationMinutes: 60 },
  });

  const selectableMembers = members.filter((m) => m.userId !== currentUserId);

  function toggleParticipant(userId: string) {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const payload: CreateSessionPayload = {
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        durationMinutes: Number(values.durationMinutes),
        agenda: values.agenda || undefined,
        participantIds: selectedIds, // le créateur est ajouté côté service
      };

      const session = await workspaceApi.createSession(mentorshipId, payload);
      toast.success("Session programmée avec succès.");
      onCreated(session);
      reset();
      setSelectedIds([]);
      onOpenChange(false);
    } catch (err) {
      toast.error("Impossible de créer la session.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Popup className="fixed z-50 my-2 top-1/2 left-1/2  w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-background p-6 shadow-xl">
          <Dialog.Title className="text-base font-semibold text-foreground">
            Nouvelle session
          </Dialog.Title>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Date et heure
              </label>
              <input
                type="datetime-local"
                {...register("scheduledAt", {
                  required: "La date est requise.",
                })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {errors.scheduledAt && (
                <p className="mt-1 text-xs text-brand-rose">
                  {errors.scheduledAt.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Durée (minutes)
              </label>
              <input
                type="number"
                min={15}
                step={15}
                {...register("durationMinutes", {
                  required: true,
                  min: { value: 15, message: "Durée minimale : 15 minutes." },
                })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {errors.durationMinutes && (
                <p className="mt-1 text-xs text-brand-rose">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Agenda (optionnel)
              </label>
              <textarea
                {...register("agenda")}
                rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Sujets à aborder..."
              />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Participants
              </p>

              {/* le créateur, affiché pré-coché et désactivé */}
              <label className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm opacity-60">
                <input type="checkbox" checked disabled />
                Vous (créateur de la session)
              </label>

              <div className="mt-1 space-y-1">
                {selectableMembers.map((member) => (
                  <label
                    key={member.userId}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(member.userId)}
                      onChange={() => toggleParticipant(member.userId)}
                    />
                    {member.name}
                    <span className="text-xs text-muted-foreground">
                      (
                      {member.role === "owner"
                        ? "Fondateur"
                        : member.role === "mentor"
                          ? "Mentor"
                          : "Collaborateur"}
                      )
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close
                render={
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-accent"
                  />
                }
              >
                Annuler
              </Dialog.Close>
              {canCreateSession && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Création..." : "Programmer"}
                </button>
              )}
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
