"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type ProfileTab = "email" | "step1" | "step2" | "step3";

interface ProfileEditTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "email", label: "Email et mot de passe" },
  { id: "step1", label: "Informations générales" },
  { id: "step2", label: "Compétences et domaines" },
  { id: "step3", label: "Disponibilités et liens" },
];

export function ProfileEditTabs({ activeTab, onTabChange }: ProfileEditTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Sections du profil"
      className="flex flex-wrap gap-0 rounded-2xl bg-muted/50 p-0.5"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              isActive
                ? "text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="profile-edit-tab-pill"
                className="absolute inset-0 rounded-xl bg-gradient-brand shadow-sm shadow-black/10"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}