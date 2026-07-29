import { NextSessionDetailCard } from "./NextSessionDetailCard";
import { SessionHistoryList } from "./SessionHistoryList";
import type { Session } from "../../../types/workspaceTypes";

type Props = {
  nextSession: Session | null;
  partnerInitials: string;
  selfInitials: string;
  pastSessions: Session[];
  onJoin: () => void;
  onReschedule: () => void;
  onViewDetails: (sessionId: string) => void;
  onNewSession: () => void;
};

export function SessionsTab({
  nextSession,
  partnerInitials,
  selfInitials,
  pastSessions,
  onJoin,
  onReschedule,
  onViewDetails,
  onNewSession,
}: Props) {
  return (
    <div className="space-y-5">
      {nextSession && (
        <NextSessionDetailCard
          sessionNumber={nextSession.number}
          date={nextSession.date}
          durationMinutes={nextSession.durationMinutes}
          participants={[
            { initials: partnerInitials, accent: "rose" },
            { initials: selfInitials, accent: "navy" },
          ]}
          onJoin={onJoin}
          onReschedule={onReschedule}
        />
      )}

      <SessionHistoryList
        sessions={pastSessions}
        onViewDetails={onViewDetails}
        onNewSession={onNewSession}
      />
    </div>
  );
}