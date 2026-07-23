"use client";

export type ProjectsView = "mine" | "explore" | "requests";

interface ProjectsTabsProps {
  view: ProjectsView;
  onViewChange: (view: ProjectsView) => void;
  requestsCount?: number;
}

const TABS: { value: ProjectsView; label: string; shortLabel: string }[] = [
  { value: "mine", label: "Mes Startups", shortLabel: "Mes projets" },
  { value: "explore", label: "Explorer les projets", shortLabel: "Explorer" },
  { value: "requests", label: "Demandes", shortLabel: "Demandes" },
];

//cmpst
export function ProjectsTabs({
  view,
  onViewChange,
  requestsCount = 0,
}: ProjectsTabsProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide sm:w-auto sm:overflow-visible">
      <div className="inline-flex min-w-full items-center gap-1 rounded-full border border-border bg-muted/40 p-1 sm:min-w-0">
        {TABS.map((tab) => {
          const isActive = tab.value === view;
          const showBadge = tab.value === "requests" && requestsCount > 0;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onViewChange(tab.value)}
              className={`inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {showBadge && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-rose px-1 text-[10px] font-semibold text-white">
                  {requestsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}