
import { Video } from "lucide-react";

type Props = {
  date: string;
  durationMinutes: number;
  partnerInitials: string;
  selfInitials: string;
  onJoin: () => void;
};

export function NextSessionCard({ date, durationMinutes, partnerInitials, selfInitials, onJoin }: Props) {
  const label = new Date(date).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between rounded-2xl bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
          <Video className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Prochaine Session</p>
          <p className="text-sm font-medium text-foreground">
            {label} · {durationMinutes} min
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-brand-rose text-[10px] font-semibold text-white">
            {partnerInitials}
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-brand-navy text-[10px] font-semibold text-white">
            {selfInitials}
          </span>
        </div>
        <button
          onClick={onJoin}
          className="flex items-center gap-1.5 rounded-3xl bg-brand-blue px-3 py-2 text-xs font-medium text-white"
        >
          <Video className="h-3.5 w-3.5" />
          Rejoindre la Session
        </button>
      </div>
    </div>
  );
}