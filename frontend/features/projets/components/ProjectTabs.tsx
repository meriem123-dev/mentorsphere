"use client";

export type ProjectsView = "mine" | "explore" | "requests";

interface ProjectsTabsProps {
  view: ProjectsView;
  onViewChange: (view: ProjectsView) => void;
  requestsCount?: number;
}

const TABS: { value: ProjectsView; label: string }[] = [
  { value: "mine", label: "Mes Startups" },
  { value: "explore", label: "Explorer les projets" },
  { value: "requests", label: "Demandes" },
];

//cmpst
export function ProjectsTabs({
  view,
  onViewChange,
  requestsCount = 0,
}: ProjectsTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
      {TABS.map((tab) => {
        const isActive = tab.value === view;
        const showBadge = tab.value === "requests" && requestsCount > 0;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onViewChange(tab.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {showBadge && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-rose px-1 text-[10px] font-semibold text-white">
                {requestsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}