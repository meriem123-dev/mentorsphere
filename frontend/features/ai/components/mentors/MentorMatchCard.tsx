"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { RatingRing } from "@/features/explore/components/rating-ring";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { MentorMatch } from "../../../../types/aiTypes";

export function MentorMatchCard({
  mentor,
  index = 0,
  onViewProfile,
}: {
  mentor: MentorMatch;
  index?: number;
  onViewProfile?: (mentorId: string) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      onClick={() => onViewProfile?.(mentor.id)}
      className="group relative flex flex-col overflow-hidden rounded-2xl cursor-pointer border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <span
        className="absolute inset-y-0 left-0 w-1 bg-gradient-brand"
        aria-hidden
      />

      <div className="flex items-start gap-4 p-5 pl-6">
        <div className="relative shrink-0 flex h-[58px] w-[58px] items-center justify-center">
          <RatingRing rating={mentor.matchScore / 20} size={58} strokeWidth={3} />
          <div className="absolute inset-0 flex items-center justify-center">
            <UserAvatar
              user={{
                name: mentor.name,
                initials: mentor.initials,
                avatarUrl: mentor.avatarUrl,
              }}
              accent="rose"
              size="lg"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">
                {mentor.name}
              </h3>
              <p className="truncate text-sm text-muted-foreground">
                {mentor.role} · {mentor.company}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-brand-rose" />
              {mentor.matchScore}%
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {mentor.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {mentor.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 font-medium text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                mentor.availability === "available" ? "bg-success" : "bg-muted-foreground/40"
              }`}
            />
            {mentor.availability === "available" ? "Disponible" : "Occupé"}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onViewProfile?.(mentor.id);
        }}
        className="relative mt-auto flex items-center justify-center gap-1.5 bg-gradient-brand py-3 text-sm font-medium text-white transition-[filter] hover:brightness-110 cursor-pointer"
      >
        Voir le profil
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </motion.article>
  );
}