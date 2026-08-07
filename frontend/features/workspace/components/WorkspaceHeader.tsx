import { getDomainBadgeClasses } from "@/lib/expertise";

type Props = {
  startupName: string;
  startupInitials: string;
  since: string;
  stage: string;
  domain: string;
};

export function WorkspaceHeader({ startupName, startupInitials, since, stage, domain }: Props) {
  const sinceLabel = new Date(since).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col w-full gap-4 rounded-2xl bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
          {startupInitials}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">
            {startupName}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate">Workspace actif · Depuis le {sinceLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
          {stage}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getDomainBadgeClasses(domain)}`}>
          {domain}
        </span>
      </div>
    </div>
  );
}