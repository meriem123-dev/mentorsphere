"use client";

import type { AITabId } from "../../../types/aiTypes";

const TABS: { id: AITabId; label: string }[] = [
  { id: "resume", label: "Résumé IA" },
  { id: "mentors", label: "Recommandation mentors" },
  { id: "analyse", label: "Analyse approfondie" },
  { id: "discussion", label: "Discussion IA" },
];

type Props = { active: AITabId; onChange: (tab: AITabId) => void };

export function AITabsNav({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-gradient-brand text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}