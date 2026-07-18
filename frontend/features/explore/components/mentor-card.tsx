"use client";

import { motion } from "framer-motion";
import { Star, ArrowUpRight, Clock, Check, X } from "lucide-react";
import { RatingRing } from "./rating-ring";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EXPERTISE_STYLES, type ExpertiseDomain } from "@/lib/expertise";

export type MentorshipRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export interface MentorCardData {
  id: string;
  name: string;
  title: string;
  expertise: ExpertiseDomain;
  rating: number;
  menteeCount: number;
  avatarUrl?: string;
  initials: string;
  mentorshipStatus?: MentorshipRequestStatus | null;
  sentRequestsCount?: number;
  hasRequestedAll?: boolean;
  requestedStartupIds?: string[];
}

const STATUS_CONFIG: Record<
  MentorshipRequestStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  PENDING: {
    label: "Demande envoyée",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  ACCEPTED: {
    label: "Mentorat accepté",
    icon: Check,
    className: "bg-success/10 text-success",
  },
  REJECTED: {
    label: "Demande refusée",
    icon: X,
    className: "bg-danger/10 text-danger",
  },
  CANCELLED: {
    label: "Demande annulée",
    icon: X,
    className: "bg-muted text-muted-foreground",
  },
};

export function MentorCard({
  mentor,
  index = 0,
  onRequestMentorship,
}: {
  mentor: MentorCardData;
  index?: number;
  onRequestMentorship?: (mentorId: string, mentorName: string) => void;
}) {
  const domain =
    EXPERTISE_STYLES[mentor.expertise] ?? Object.values(EXPERTISE_STYLES)[0];
  const Icon = domain.icon;

  // REJECTED et CANCELLED n'empêchent pas une nouvelle demande
  const canRequest =
    !mentor.mentorshipStatus ||
    mentor.mentorshipStatus === "REJECTED" ||
    mentor.mentorshipStatus === "CANCELLED";

  const statusConfig =
    mentor.mentorshipStatus && !canRequest
      ? STATUS_CONFIG[mentor.mentorshipStatus]
      : null;

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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${domain.dot}`}
        aria-hidden
      />

      <div className="flex items-start gap-4 p-5 pl-6">
        <div className="relative shrink-0 flex h-[58px] w-[58px] items-center justify-center">
          <RatingRing rating={mentor.rating} size={58} strokeWidth={3} />
          <div className="absolute inset-0 flex items-center justify-center">
            <UserAvatar
              user={{
                name: mentor.name,
                initials: mentor.initials,
                avatarUrl: mentor.avatarUrl,
              }}
              accent={domain.accent}
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
                {mentor.title}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {mentor.rating.toFixed(1)}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {mentor.expertise}
              </span>
            </span>
            <span className="text-muted-foreground">
              {mentor.menteeCount} mentorés
            </span>
          </div>
        </div>
      </div>

      {mentor.sentRequestsCount ? (
        <div className="px-5 pb-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            {mentor.sentRequestsCount} demande
            {mentor.sentRequestsCount > 1 ? "s" : ""} envoyée
            {mentor.sentRequestsCount > 1 ? "s" : ""}
          </span>
        </div>
      ) : null}

      {statusConfig ? (
        <span
          className={`flex items-center justify-center gap-1.5 py-3 text-sm font-medium ${statusConfig.className}`}
        >
          <statusConfig.icon className="h-3.5 w-3.5" />
          {statusConfig.label}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onRequestMentorship?.(mentor.id, mentor.name)}
          disabled={mentor.hasRequestedAll}
          className="relative mt-auto flex items-center justify-center gap-1.5 bg-gradient-brand py-3 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mentor.hasRequestedAll
            ? "Demande envoyée pour tous vos projets"
            : "Demander un mentorat"}
          {!mentor.hasRequestedAll && (
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </button>
      )}
    </motion.article>
  );
}
