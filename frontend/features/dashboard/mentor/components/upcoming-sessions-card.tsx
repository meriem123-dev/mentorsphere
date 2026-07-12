// features/mentor-dashboard/components/upcoming-sessions-card.tsx
import { DashboardCard } from "./dashboard-card";
import type { UpcomingSession } from "@/types/dashTypes";

export function UpcomingSessionsCard({ sessions }: { sessions: UpcomingSession[] }) {
  return (
    <DashboardCard
      title="Prochaines Sessions"
      action={
        <button type="button" className="text-xs font-medium text-brand-rose hover:underline">
          Voir tout
        </button>
      }
    >
      <ul className="space-y-3">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white bg-brand-rose`}
              >
                {session.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{session.menteeName}</p>
                <p className="truncate text-xs text-muted-foreground">{session.topic}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-brand-rose">{session.when}</p>
              <button type="button" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                Rejoindre
              </button>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}