"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";
import { SessionRoom } from "@/features/sessions/components/SessionRoom";
import type { Session } from "@/types/workspaceTypes";

export default function SessionRoomPage() {
  const params = useParams<{ id: string; sessionId: string }>();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await workspaceApi.getSessionById(params.id, params.sessionId);
        if (!cancelled) setSession(data);
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
  if (!session || !session.meetingUrl) {
    return <p className="p-6 text-sm text-muted-foreground">Session introuvable.</p>;
  }

  return (
    <div className="p-6">
      <SessionRoom
        mentorshipId={params.id}
        meetingUrl={session.meetingUrl}
        sessionNumber={session.number}
        userName={user ? `${user.firstName} ${user.lastName}` : "Participant"}
      />
    </div>
  );
}