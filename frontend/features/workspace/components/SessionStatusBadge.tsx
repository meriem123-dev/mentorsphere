type SessionStatus = "upcoming" | "completed" | "cancelled";

const STATUS_STYLES: Record<SessionStatus, string> = {
  upcoming: "bg-brand-blue/10 text-brand-blue",
  completed: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-brand-rose/10 text-brand-rose",
};

const STATUS_LABELS: Record<SessionStatus, string> = {
  upcoming: "À venir",
  completed: "Terminée",
  cancelled: "Annulée",
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}