"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MenteeStatusBadge } from "./MenteeStatusBadge";
import { MenteeProgressBar } from "./MenteeProgressBar";
import type { Mentee } from "../../../types/mentoratTypes";

interface MenteeCardProps {
  mentee: Mentee;
  onOpen?: (mentee: Mentee) => void;
}

export function MenteeCard({ mentee, onOpen }: MenteeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen?.(mentee)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="group w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            user={{
              name: mentee.name,
              initials: mentee.initials,
              avatarUrl: mentee.avatarUrl ?? undefined,
            }}
            size="md"
            accent={mentee.accent}
          />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {mentee.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {mentee.projectName} · {mentee.stage}
            </p>
          </div>
        </div>

        <MenteeStatusBadge status={mentee.status} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Vu {mentee.lastSeenLabel.toLowerCase()}
        </span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          {mentee.sessionsCount} session{mentee.sessionsCount > 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-4">
        <MenteeProgressBar value={mentee.progression} />
      </div>

      <div className="mt-3 flex items-center justify-end text-xs font-medium text-brand-rose opacity-0 transition-opacity group-hover:opacity-100">
        Ouvrir l&apos;espace
        <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden />
      </div>
    </motion.button>
  );
}