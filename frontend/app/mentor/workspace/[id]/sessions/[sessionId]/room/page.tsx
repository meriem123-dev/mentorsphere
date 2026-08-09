"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";
import { SessionRoom } from "@/features/sessions/components/SessionRoom";
import { SharedNotesEditor } from "@/features/sessions/components/SharedNotesEditor";
import type { SessionRoomCredentials, Session } from "@/types/workspaceTypes";

export default function SessionRoomPage() {
  const params = useParams<{ id: string; sessionId: string }>();
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<SessionRoomCredentials | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [creds, sessionDetail] = await Promise.all([
          workspaceApi.getSessionRoomCredentials(params.id, params.sessionId),
          workspaceApi.getSessionById(params.id, params.sessionId),
        ]);
        if (!cancelled) {
          setCredentials(creds);
          setSession(sessionDetail);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, params.sessionId]);

  if (loading) return <p className="p-6 text-sm text-muted-foreground">Chargement...</p>;
  if (error || !credentials || !session) {
    return <p className="p-6 text-sm text-muted-foreground">Session introuvable.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-[2fr_1fr]">
      <SessionRoom
        appId={credentials.appId}
        room={credentials.room}
        jwt={credentials.token}
        userName={user ? `${user.firstName} ${user.lastName}` : "Participant"}
        userEmail={user?.email ?? ""}
      />

      <SharedNotesEditor
        mentorshipId={params.id}
        sessionId={params.sessionId}
        initialNotes={session.rawNotes ?? null}
      />
    </div>
  );
}