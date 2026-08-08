import { NextSessionDetailCard } from "./NextSessionDetailCard";
import { SessionHistoryList } from "./SessionHistoryList";
import type { Session, WorkspaceMember } from "../../../types/workspaceTypes";

type Props = {
  upcomingSessions: Session[];
  partnerInitials: string;
  selfInitials: string;
  pastSessions: Session[];
  members: WorkspaceMember[];
  currentUserId: string;
  onJoin: () => void;
  onReschedule: () => void;
  onViewDetails: (sessionId: string) => void;
  onNewSession: () => void;
};

export function SessionsTab({
  upcomingSessions,
  partnerInitials,
  selfInitials,
  pastSessions,
  members,
  currentUserId,
  onJoin,
  onReschedule,
  onViewDetails,
  onNewSession,
}: Props) {
  const currentMember = members.find((m) => m.userId === currentUserId);
  const canCreateSession =
    currentMember?.role === "owner" || currentMember?.role === "mentor";

  return (
    <div className="space-y-5">
      {upcomingSessions.map((session) => (
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
          onJoin={onJoin}
          onReschedule={onReschedule}
        />
      ))}

      <SessionHistoryList
        sessions={pastSessions}
        onViewDetails={onViewDetails}
        onNewSession={onNewSession}
        canCreateSession={canCreateSession}
      />
    </div>
  );
}