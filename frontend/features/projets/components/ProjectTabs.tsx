"use client";

export type ProjectsView = "mine" | "explore";

interface ProjectsTabsProps {
  view: ProjectsView;
  onViewChange: (view: ProjectsView) => void;
}

const TABS: { value: ProjectsView; label: string }[] = [
  { value: "mine", label: "Mes Startups" },
  { value: "explore", label: "Explorer les projets" },
];


//cmpst
export function ProjectsTabs({ view, onViewChange }: ProjectsTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
      {TABS.map((tab) => {
        const isActive = tab.value === view;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onViewChange(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}