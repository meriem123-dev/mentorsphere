"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";
import { WorkspaceHeader } from "@/features/workspace/components/WorkspaceHeader";
import { WorkspaceProgress } from "@/features/workspace/components/WorkspaceProgress";
import { NextSessionCard } from "@/features/workspace/components/NextSessionCard";
import { WorkspaceTabNav } from "@/features/workspace/components/WorkspaceTabNav";
import { ChatPanel } from "@/features/workspace/components/ChatPanel";
import { SessionsTab } from "@/features/workspace/components/SessionsTab";
import { ObjectifsTab } from "@/features/workspace/components/ObjectifsTab";
import { DocumentsTab } from "@/features/workspace/components/DocumentsTab";
import { MembersTab } from "@/features/workspace/components/MembersTab";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SessionDetailsModal } from "@/features/sessions/components/SessionDetailModal";

import type {
  WorkspaceMessage,
  WorkspaceTab,
  Session,
  Objective,
  WorkspaceDocument,
  WorkspaceMember,
  WorkspaceOverview,
  SessionStatus,
} from "@/types/workspaceTypes";
import { useWorkspaceSocket } from "@/hooks/use-workspace-socket";
import { SessionModal } from "./SessionModal";
import { usePathname } from "next/navigation";
import { RescheduleSessionModal } from "@/features/sessions/components/RescheduleSessionModal";

export default function WorkspacePageClient() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const pathname = usePathname();
  const rolePrefix = pathname.startsWith("/mentor") ? "mentor" : "entrepreneur";

  const [header, setHeader] = useState<WorkspaceOverview["header"] | null>(
    null,
  );
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const { sendMessage } = useWorkspaceSocket(id, (message) => {
    setMessages((prev) => [...prev, message]);
  });

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [isLoading, setIsLoading] = useState(true);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const [nextSessionMeetingUrl, setNextSessionMeetingUrl] = useState<
    string | undefined
  >();

  const upcomingSessions = sessions
    .filter((s) => s.status === "SCHEDULED")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  const nextSession = upcomingSessions[0] ?? null;
  const pastSessions = sessions.filter((s) => s.status !== "SCHEDULED");
  const [reschedulingSession, setReschedulingSession] =
    useState<Session | null>(null);

  const currentMember = members.find((m) => m.userId === user?.id);
  const canManageSessions =
    currentMember?.role === "owner" || currentMember?.role === "mentor";
  const isMentor = currentMember?.role === "mentor";
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);

  //appels API workspace
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [overview, history, objectivesData, documentsData, sessionsData] =
          await Promise.all([
            workspaceApi.getOverview(id),
            workspaceApi.getMessages(id),
            workspaceApi.getObjectives(id),
            workspaceApi.getDocuments(id),
            workspaceApi.getSessions(id),
          ]);
        if (cancelled) return;

        setHeader(overview.header);
        setMembers(overview.members);
        setMessages(history);
        setObjectives(objectivesData);
        setDocuments(documentsData);
        setSessions(
          sessionsData.map((s) => ({
            ...s,
            status: s.status,
          })),
        );

        // reste
      } catch (err) {
        if (!cancelled) toast.error("Impossible de charger le workspace");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const selfInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : "";

  //gérer download doc
  const handleDownloadDocument = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (doc) window.open(doc.downloadUrl, "_blank");
  };

  //gérer sessions
  const handleNewSession = () => setIsSessionModalOpen(true);

  const handleSessionCreated = (newSession: Session) => {
    setSessions((prev) => [
      ...prev,
      { ...newSession, status: newSession.status },
    ]);
  };

  function handleJoinSession(sessionId: string) {
    router.push(`/${rolePrefix}/workspace/${id}/sessions/${sessionId}/room`);
  }

  const handleViewSessionDetails = (sessionId: string) =>
    setViewingSessionId(sessionId);

  const handleReschedule = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) setReschedulingSession(target);
  };

  const handleConfirmReschedule = async (
    sessionId: string,
    payload: { scheduledAt: string; durationMinutes: number },
  ) => {
    try {
      const updated = await workspaceApi.rescheduleSession(
        id,
        sessionId,
        payload,
      );
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, ...updated } : s)),
      );
      toast.success("Session reprogrammée");
    } catch {
      toast.error("Impossible de reprogrammer la session");
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      const updated = await workspaceApi.cancelSession(id, sessionId);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, ...updated } : s)),
      );
      toast.success("Session annulée");
    } catch {
      toast.error("Impossible d'annuler la session");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await workspaceApi.deleteSession(id, sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session supprimée");
    } catch {
      toast.error("Impossible de supprimer la session");
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const updated = await workspaceApi.updateSessionStatus(
        id,
        sessionId,
        "COMPLETED",
      );
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, ...updated } : s)),
      );
      toast.success("Session marquée comme terminée");
    } catch (err) {
      toast.error("Impossible de marquer la session comme terminée");
    }
  };

  if (isLoading || !header) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Chargement du workspace...
      </div>
    );
  }

  //affichage workspace
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        startupName={header.startupName}
        startupInitials={header.startupInitials}
        since={header.since}
        stage={header.stage}
        domain={header.domain}
      />

      <WorkspaceProgress progress={header.progress} />

      {nextSession && (
        <NextSessionCard
          date={nextSession.scheduledAt}
          durationMinutes={nextSession.durationMinutes}
          participants={(nextSession.participants ?? []).map((p) => {
            const member = members.find((m) => m.userId === p.userId);
            return {
              id: p.userId,
              initials: member?.initials ?? `${p.firstName[0]}${p.lastName[0]}`,
            };
          })}
          onJoin={() => handleJoinSession(nextSession.id)}
        />
      )}

      <WorkspaceTabNav active={activeTab} onChange={setActiveTab} />

      {activeTab === "chat" && (
        <ChatPanel
          messages={messages}
          partnerName={header.startupName}
          selfId={user?.id ?? ""}
          onSend={sendMessage}
        />
      )}

      {activeTab === "sessions" && (
        <SessionsTab
          upcomingSessions={upcomingSessions}
          partnerInitials={header.startupInitials}
          selfInitials={selfInitials}
          pastSessions={pastSessions}
          onJoin={handleJoinSession}
          onReschedule={handleReschedule}
          onCancel={handleCancelSession}
          onDelete={handleDeleteSession}
          onComplete={handleCompleteSession}
          onViewDetails={handleViewSessionDetails}
          onNewSession={handleNewSession}
          members={members}
          currentUserId={user?.id ?? ""}
          canManageSessions={canManageSessions}
          isMentor={isMentor}
        />
      )}

      {activeTab === "objectifs" && (
        <ObjectifsTab
          mentorshipId={id}
          objectives={objectives}
          onObjectivesChange={setObjectives}
        />
      )}

      {activeTab === "documents" && (
        <DocumentsTab
          mentorshipId={id}
          documents={documents}
          onDocumentsChange={setDocuments}
          onDownload={handleDownloadDocument}
        />
      )}

      {activeTab === "members" && <MembersTab members={members} />}

      <SessionModal
        open={isSessionModalOpen}
        onOpenChange={setIsSessionModalOpen}
        mentorshipId={id}
        members={members}
        currentUserId={user?.id ?? ""}
        onCreated={handleSessionCreated}
      />

      <RescheduleSessionModal
        session={reschedulingSession}
        onOpenChange={(open) => !open && setReschedulingSession(null)}
        onConfirm={handleConfirmReschedule}
      />
      <SessionDetailsModal
        mentorshipId={id}
        sessionId={viewingSessionId}
        onOpenChange={(open) => !open && setViewingSessionId(null)}
      />
    </div>
  );
}
