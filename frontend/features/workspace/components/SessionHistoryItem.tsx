import { MoreHorizontal } from "lucide-react";
import { SessionStatusBadge } from "./SessionStatusBadge";

type Props = {
  sessionNumber: number;
  status: "COMPLETED" | "CANCELLED";
  date: string;
  durationMinutes: number;
  onViewDetails: () => void;
  onMenuClick?: () => void;
};

export function SessionHistoryItem({
  sessionNumber,
  status,
  date,
  durationMinutes,
  onViewDetails,
  onMenuClick,
}: Props) {
  const dateLabel = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between rounded-xl bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
          #{sessionNumber}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">Session #{sessionNumber}</p>
            <SessionStatusBadge status={status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {dateLabel} · {durationMinutes} min
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onViewDetails}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          Voir détails
        </button>
        <button
          onClick={onMenuClick}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}