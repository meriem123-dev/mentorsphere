"use client";

import { useEffect, useRef, useState } from "react";
import { workspaceApi } from "../../workspace/api/workspaceAPI";

type Props = {
  mentorshipId: string;
  sessionId: string;
  initialNotes: string | null;
};

type SaveState = "idle" | "saving" | "saved";

export function SharedNotesEditor({ mentorshipId, sessionId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange(value: string) {
    setNotes(value);
    setSaveState("saving");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
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
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Notez les points clés de la session, les décisions, les actions à suivre..."
        rows={8}
        className="w-full resize-none rounded-xl bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue/50"
      />
    </div>
  );
}