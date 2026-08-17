import { CheckCircle2, CircleDot, Circle } from "lucide-react";
import type { Startup } from "@/types/startupTypes";
import { getStepStats } from "@/features/projets/utils/stepMeta";

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

export function StartupJourneyHeader({ startup }: { startup: Startup }) {
  const { done, current, upcoming, progressPercent } = getStepStats(startup.steps);

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-r from-brand-navy/5 to-brand-rose/5 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-lg font-semibold text-white">
            {getInitials(startup.name)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground">{startup.name}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {startup.domain} · Créé le {formatDate(startup.createdAt)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3 w-3 shrink-0" /> {done} terminées
              </span>
              <span className="flex items-center gap-1 text-brand-blue">
                <CircleDot className="h-3 w-3 shrink-0" /> {current} en cours
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Circle className="h-3 w-3 shrink-0" /> {upcoming} non démarrées
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
          <p className="text-xs text-muted-foreground sm:hidden">Progression</p>
          <div className="flex items-baseline gap-1 sm:block">
            <p className="text-2xl font-bold text-foreground">{progressPercent}%</p>
            <p className="hidden text-xs text-muted-foreground sm:block">progression</p>
          </div>
        </div>
      </div>
    </div>
  );
}