"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";
import { SessionStatusBadge } from "../../workspace/components/SessionStatusBadge";
import type { Session } from "@/types/workspaceTypes";

type Props = {
  mentorshipId: string;
  sessionId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function SessionDetailsModal({ mentorshipId, sessionId, onOpenChange }: Props) {
  return (
    <Dialog.Root open={!!sessionId} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Popup className="fixed z-50 my-2 max-h-[85vh] top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-background p-6 shadow-xl overflow-y-auto">
          {sessionId && (
            <SessionDetailsContent key={sessionId} mentorshipId={mentorshipId} sessionId={sessionId} />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SessionDetailsContent({
  mentorshipId,
  sessionId,
}: {
  mentorshipId: string;
  sessionId: string;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await workspaceApi.getSessionById(mentorshipId, sessionId);
        if (!cancelled) setSession(data);
      } catch {
        if (!cancelled) toast.error("Impossible de charger les détails de la session");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [mentorshipId, sessionId]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const updated = await workspaceApi.generateSessionAISummary(mentorshipId, sessionId);
      setSession(updated);
    } catch (error) {
      toast.error(("Impossible de générer le résumé IA."));
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <p className="py-6 text-sm text-muted-foreground">Chargement...</p>;
  }

  if (!session) {
    return <p className="py-6 text-sm text-muted-foreground">Session introuvable.</p>;
  }

  const dateLabel = new Date(session.scheduledAt).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLabel = new Date(session.scheduledAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const canGenerateSummary = session.status === "COMPLETED" && !!session.rawNotes;

  return (
    <>
      <div className="flex items-center gap-2">
        <Dialog.Title className="text-base font-semibold text-foreground">
          Session #{session.number}
        </Dialog.Title>
        <SessionStatusBadge status={session.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{dateLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Heure</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{timeLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Durée</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{session.durationMinutes} min</p>
        </div>
      </div>

      {session.agenda && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">Agenda</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{session.agenda}</p>
        </div>
      )}

      {session.participants && session.participants.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">Participants</p>
          <ul className="mt-1 space-y-1">
            {session.participants.map((p) => (
              <li key={p.userId} className="text-sm text-foreground">
                {p.firstName} {p.lastName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {session.rawNotes && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{session.rawNotes}</p>
        </div>
      )}

      {canGenerateSummary && (
        <div className="mt-4 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-rose">Résumé IA</p>
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isGenerating ? "Génération..." : session.aiSummary ? "Régénérer" : "Générer le résumé IA"}
            </button>
          </div>

          {session.aiSummary && (
            <div className="mt-3 space-y-3">
              {session.aiSummary.objectifsAtteints.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Objectifs atteints</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {session.aiSummary.objectifsAtteints.map((item, i) => (
                      <li key={i} className="text-sm text-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {session.aiSummary.pointsCles.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Points clés</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {session.aiSummary.pointsCles.map((item, i) => (
                      <li key={i} className="text-sm text-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {session.aiSummary.prochainesActions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Prochaines actions</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {session.aiSummary.prochainesActions.map((item, i) => (
                      <li key={i} className="text-sm text-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-5">
        <Dialog.Close
          render={
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-accent"
            />
          }
        >
          Fermer
        </Dialog.Close>
      </div>
    </>
  );
}