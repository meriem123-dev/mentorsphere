"use client";

import { motion } from "framer-motion";
import { Tabs } from "@base-ui/react/tabs";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { EXPERTISE_DOMAINS, type ExpertiseDomain } from "@/lib/expertise";

type View = "mentors" | "projets" | "entrepreneurs";

const VIEWS: { value: View; label: string }[] = [
  { value: "mentors", label: "Mentors" },
  { value: "projets", label: "Projets" },
  { value: "entrepreneurs", label: "Entrepreneurs" },
];

export function ExploreFilters({
  expertise,
  onExpertiseChange,
  view,
  onViewChange,
}: {
  expertise: string;
  onExpertiseChange: (v: string) => void;
  view: View;
  onViewChange: (v: View) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ChoicePills
        options={["Tous", ...EXPERTISE_DOMAINS]}
        value={expertise}
        onChange={(v) => onExpertiseChange(v as string)}
        showCheck
      />

      <Tabs.Root
        value={view}
        onValueChange={(v) => onViewChange(v as View)}
        className="relative flex gap-1 rounded-full border border-border bg-muted/40 p-1"
      >
        <Tabs.List className="relative flex gap-1">
          {VIEWS.map((tab) => {
            const active = view === tab.value;
            return (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                onClick={() => onViewChange(tab.value)}
                className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="explore-view-indicator"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-brand"
                  />
                )}
                {tab.label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs.Root>
    </div>
  );
}