import { NextSessionDetailCard } from "./NextSessionDetailCard";
import { SessionHistoryList } from "./SessionHistoryList";
import type { Session, WorkspaceMember } from "../../../types/workspaceTypes";

type Props = {
  upcomingSessions: Session[];
  partnerInitials: string;
  selfInitials: string;
  pastSessions: Session[];
  onJoin: (sessionId: string) => void;
  members: WorkspaceMember[];
  currentUserId: string;
  onReschedule: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onComplete: (sessionId: string) => void;
  onViewDetails: (sessionId: string) => void;
  onNewSession: () => void;
  canManageSessions: boolean;
  isMentor: boolean;
};

export function SessionsTab({
  upcomingSessions,
  pastSessions,
  members,
  currentUserId,
  onJoin,
  onReschedule,
  onCancel,
  onDelete,
  onComplete,
  onViewDetails,
  onNewSession,
  canManageSessions,
  isMentor,
}: Props) {
  const currentMember = members.find((m) => m.userId === currentUserId);
  const canCreateSession =
    currentMember?.role === "owner" || currentMember?.role === "mentor";

  return (
    <div className="space-y-5">
      {upcomingSessions.map((session) => {
        const canDeleteThis = canManageSessions || session.createdById === currentUserId;
        return (
          <NextSessionDetailCard
            key={session.id}
            sessionNumber={session.number}
            date={session.scheduledAt}
            durationMinutes={session.durationMinutes}
            participants={(session.participants ?? []).map((p) => {
              const member = members.find((m) => m.userId === p.userId);
              return {
                id: p.userId,
                initials: member?.initials ?? `${p.firstName[0]}${p.lastName[0]}`,
              };
            })}
            onJoin={() => onJoin(session.id)}
            onReschedule={canManageSessions ? () => onReschedule(session.id) : undefined}
            onCancel={canManageSessions ? () => onCancel(session.id) : undefined}
            onDelete={canDeleteThis ? () => onDelete(session.id) : undefined}
            onComplete={isMentor ? () => onComplete(session.id) : undefined}
          />
        );
      })}

      <SessionHistoryList
        sessions={pastSessions}
        currentUserId={currentUserId}
        canManageSessions={canManageSessions}
        onViewDetails={onViewDetails}
        onNewSession={onNewSession}
        onDelete={onDelete}
        canCreateSession={canCreateSession}
      />
    </div>
  );
}
