import { Video, Trash2, XCircle, CheckCircle2 } from "lucide-react";
import { SessionStatusBadge } from "./SessionStatusBadge";

type Participant = { initials: string; accent?: "blue" | "rose" | "navy" };

type Props = {
  sessionNumber: number;
  date: string;
  durationMinutes: number;
  participants: Participant[];
  onJoin: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
};

const AVATAR_COLORS = ["bg-brand-rose", "bg-brand-navy", "bg-brand-blue"];

export function NextSessionDetailCard({
  sessionNumber,
  date,
  durationMinutes,
  participants,
  onJoin,
  onReschedule,
  onCancel,
  onDelete,
  onComplete,
}: Props) {
  const parsed = new Date(date);
  const dateLabel = parsed.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLabel = parsed.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            Prochaine session
          </h2>
          <SessionStatusBadge status="SCHEDULED" />
        </div>
        <div className="flex items-center gap-3">
          {onReschedule && (
            <button
              onClick={onReschedule}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Reprogrammer
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              <XCircle className="h-3.5 w-3.5" />
              Annuler
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-xs font-medium text-destructive hover:opacity-80"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Session #{sessionNumber}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {dateLabel}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Heure</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {timeLabel}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Durée</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {durationMinutes} min
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Participants</p>
          <div className="mt-1 flex -space-x-2">
            {participants.map((p, i) => (
              <span
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {p.initials}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onJoin}
          className="mt-4 flex items-center gap-1.5 rounded-3xl bg-brand-blue px-4 py-2 text-xs font-medium text-white"
        >
          <Video className="h-3.5 w-3.5" />
          Rejoindre la session
        </button>
        {onComplete && (
          <button
            onClick={onComplete}
            className="flex items-center gap-1 text-xs font-medium text-brand-blue hover:opacity-80 hover:bg-background rounded-2xl"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Marquer terminée
          </button>
        )}
      </div>
    </div>
  );
}
