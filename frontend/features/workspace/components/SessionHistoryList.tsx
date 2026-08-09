import { Plus } from "lucide-react";
import { SessionHistoryItem } from "./SessionHistoryItem";
import type { Session } from "../../../types/workspaceTypes";

type Props = {
  sessions: Session[];
  onViewDetails: (sessionId: string) => void;
  onNewSession: () => void;
  canCreateSession: boolean;
};

export function SessionHistoryList({ sessions, onViewDetails, onNewSession,canCreateSession }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Sessions précédentes ({sessions.length})
        </h3>
        {canCreateSession && (
          <button
            onClick={onNewSession}
            className="flex items-center p-2 gap-1 text-xs font-medium text-primary hover:underline cursor-pointer hover:bg-muted rounded-2xl"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouvelle session
          </button>
        )}
      </div>

      <div className="space-y-2">
        {sessions.map((session) => (
          <SessionHistoryItem
            key={session.id}
            sessionNumber={session.number}
            status={session.status === "CANCELLED" ? "CANCELLED" : "COMPLETED"}
            date={session.scheduledAt}
            durationMinutes={session.durationMinutes}
            onViewDetails={() => onViewDetails(session.id)}
          />
        ))}
      </div>
    </div>
  );
}