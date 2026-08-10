"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import type { Session } from "@/types/workspaceTypes";

type Props = {
  session: Session | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    sessionId: string,
    payload: { scheduledAt: string; durationMinutes: number },
  ) => Promise<void>;
};

export function RescheduleSessionModal({ session, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog.Root open={!!session} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Popup className="fixed z-50 my-2 top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-background p-6 shadow-xl">
          {session && (
            <RescheduleForm
              key={session.id}
              session={session}
              onOpenChange={onOpenChange}
              onConfirm={onConfirm}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type FormProps = {
  session: Session;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    sessionId: string,
    payload: { scheduledAt: string; durationMinutes: number },
  ) => Promise<void>;
};

function RescheduleForm({ session, onOpenChange, onConfirm }: FormProps) {
  // état initialisé directement depuis les props, pas via un effet :
  const [date, setDate] = useState(
    new Date(session.scheduledAt).toISOString().slice(0, 16),
  );
  const [duration, setDuration] = useState(session.durationMinutes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onConfirm(session.id, {
        scheduledAt: new Date(date).toISOString(),
        durationMinutes: Number(duration),
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Dialog.Title className="text-base font-semibold text-foreground">
        Reprogrammer la session #{session.number}
      </Dialog.Title>

      <div className="mt-4 space-y-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Date et heure
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Durée (minutes)
          </label>
          <input
            type="number"
            min={15}
            step={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
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
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !date}
          className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Enregistrement..." : "Confirmer"}
        </button>
      </div>
    </>
  );
}