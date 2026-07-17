"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EXPERTISE_STYLES, type ExpertiseDomain } from "@/lib/expertise";

export interface EntrepreneurCardData {
  id: string;
  name: string;
  title: string;
  expertise: ExpertiseDomain;
  lookingFor: string[];
  avatarUrl?: string;
  initials: string;
}


//cmpst card
export function EntrepreneurCard({
  entrepreneur,
  index = 0,
  onViewProfile,
}: {
  entrepreneur: EntrepreneurCardData;
  index?: number;
  onViewProfile?: (entrepreneurId: string) => void;
}) {
  const domain =
    EXPERTISE_STYLES[entrepreneur.expertise] ?? Object.values(EXPERTISE_STYLES)[0];
  const Icon = domain.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${domain.dot}`} aria-hidden />

      <div className="flex items-start gap-4 p-5 pl-6">
        <UserAvatar
          user={{
            name: entrepreneur.name,
            initials: entrepreneur.initials,
            avatarUrl: entrepreneur.avatarUrl,
          }}
          accent={domain.accent}
          size="lg"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">
            {entrepreneur.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {entrepreneur.title}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {entrepreneur.expertise}
              </span>
            </span>
            {entrepreneur.lookingFor.slice(0, 2).map((need) => (
              <span
                key={need}
                className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 font-medium text-success"
              >
                {need}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewProfile?.(entrepreneur.id)}
        className="relative mt-auto flex items-center justify-center gap-1.5 bg-gradient-brand py-3 text-sm font-medium text-white transition-[filter] hover:brightness-110"
      >
        Voir le profil
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </motion.article>
  );
}