"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { workspaceApi } from "../../workspace/api/workspaceAPI";
import { useWorkspaceSocket } from "../../../hooks/use-workspace-socket";

type Props = {
  mentorshipId: string;
  sessionId: string;
  initialNotes: string | null;
};

type SaveState = "idle" | "saving" | "saved";

export function SharedNotesEditor({ mentorshipId, sessionId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLocalEditRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleRemoteNotesUpdate = useCallback(
    (payload: { sessionId: string; content: string }) => {
      if (payload.sessionId !== sessionId) return;

      // si l'utilisateur local a tapé il y a moins de 800ms, on ignore
      // pour ne pas lui arracher le clavier / le curseur en pleine frappe
      const typingRecently = Date.now() - lastLocalEditRef.current < 800;
      if (typingRecently) return;

      const textarea = textareaRef.current;
      const isFocused = document.activeElement === textarea;

      if (!isFocused) {
        setNotes(payload.content);
        return;
      }

      // focus mais pas en train de taper : on préserve la position relative à la fin
      const distanceFromEnd = textarea!.value.length - (textarea!.selectionStart ?? 0);
      setNotes(payload.content);
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        const newPos = Math.max(0, textareaRef.current.value.length - distanceFromEnd);
        textareaRef.current.setSelectionRange(newPos, newPos);
      });
    },
    [sessionId],
  );

  const { sendNotesUpdate } = useWorkspaceSocket(
    mentorshipId,
    () => {},
    handleRemoteNotesUpdate,
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (emitTimeoutRef.current) clearTimeout(emitTimeoutRef.current);
    };
  }, []);

  function handleChange(value: string) {
    setNotes(value);
    setSaveState("saving");
    lastLocalEditRef.current = Date.now();

    // diffusion live rapide aux autres participants (300ms)
    if (emitTimeoutRef.current) clearTimeout(emitTimeoutRef.current);
    emitTimeoutRef.current = setTimeout(() => {
      sendNotesUpdate(sessionId, value);
    }, 300);

    // persistance DB (1s, inchangé)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await workspaceApi.updateSessionNotes(mentorshipId, sessionId, value);
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, 1000);
  }

  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Notes partagées</p>
        <span className="text-xs text-muted-foreground">
          {saveState === "saving" && "Enregistrement..."}
          {saveState === "saved" && "Enregistré"}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Notez les points clés de la session, les décisions, les actions à suivre..."
        rows={8}
        className="w-full resize-none rounded-xl bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/50"
      />
    </div>
  );
}