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
import type {
  WorkspaceMessage,
  WorkspaceTab,
  Session,
  Objective,
  WorkspaceDocument,
  WorkspaceMember,
  WorkspaceOverview,
} from "@/types/workspaceTypes";
import { useWorkspaceSocket } from "@/hooks/use-workspace-socket";

export default function WorkspacePageClient() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [header, setHeader] = useState<WorkspaceOverview["header"] | null>(
    null,
  );
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const { sendMessage } = useWorkspaceSocket(id, (message) => {
    setMessages((prev) => [...prev, message]);
  });

  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [nextSessionMeetingUrl, setNextSessionMeetingUrl] = useState<
    string | undefined
  >();
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [overview, history] = await Promise.all([
          workspaceApi.getOverview(id),
          workspaceApi.getMessages(id),
        ]);
        if (cancelled) return;

        setHeader(overview.header);
        setMembers(overview.members);
        setMessages(history);

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

  const handleJoinSession = () => {
    if (nextSessionMeetingUrl) window.open(nextSessionMeetingUrl, "_blank");
  };
  const handleReschedule = () => toast.info("Reprogrammation à venir");
  const handleViewSessionDetails = (sessionId: string) =>
    toast.info(`Détails de la session ${sessionId} à venir`);
  const handleNewSession = () => toast.info("Création de session à venir");
  const handleViewObjective = (objectiveId: string) =>
    toast.info(`Détails de l'objectif ${objectiveId} à venir`);
  const handleAddGoal = () => toast.info("Ajout d'objectif à venir");
  const handleDownloadDocument = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (doc) window.open(doc.downloadUrl, "_blank");
  };
  const handleUpload = () => toast.info("Upload de document à venir");
  const handleInviteMember = () => toast.info("Invitation de membre à venir");
  const handleMemberMenuClick = (memberId: string) =>
    toast.info(`Actions pour le membre ${memberId} à venir`);

  if (isLoading || !header) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Chargement du workspace...
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
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
          date={nextSession.date}
          durationMinutes={nextSession.durationMinutes}
          partnerInitials={header.startupInitials}
          selfInitials={selfInitials}
          onJoin={handleJoinSession}
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
          nextSession={nextSession}
          partnerInitials={header.startupInitials}
          selfInitials={selfInitials}
          pastSessions={pastSessions}
          onJoin={handleJoinSession}
          onReschedule={handleReschedule}
          onViewDetails={handleViewSessionDetails}
          onNewSession={handleNewSession}
        />
      )}

      {activeTab === "objectifs" && (
        <ObjectifsTab
          objectives={objectives}
          onViewObjective={handleViewObjective}
          onAddGoal={handleAddGoal}
        />
      )}

      {activeTab === "documents" && (
        <DocumentsTab
          documents={documents}
          onDownload={handleDownloadDocument}
          onUpload={handleUpload}
        />
      )}

      {activeTab === "members" && (
        <MembersTab
          members={members}
          onInvite={handleInviteMember}
          onMemberMenuClick={handleMemberMenuClick}
        />
      )}
    </div>
  );
}
