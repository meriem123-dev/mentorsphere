"use client";

import { motion } from "framer-motion";
import { Star, Clock, Check, X, CalendarClock } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EXPERTISE_STYLES } from "@/lib/expertise";
import { ProfileInfoCard } from "@/features/profile/components/ProfileInfoCard";
import { SkillChips } from "@/features/profile/components/SkillChips";
import type { MentorProfile } from "@/types/mentorTypes";

const STATUS_CONFIG = {
  PENDING: { label: "Demande envoyée", icon: Clock, className: "bg-muted text-muted-foreground" },
  ACCEPTED: { label: "Mentorat accepté", icon: Check, className: "bg-success/10 text-success" },
  REJECTED: { label: "Demande refusée", icon: X, className: "bg-danger/10 text-danger" },
  CANCELLED: { label: "Demande annulée", icon: X, className: "bg-muted text-muted-foreground" },
} as const;

export function MentorProfileView({
  mentor,
  onRequestMentorship,
}: {
  mentor: MentorProfile;
  onRequestMentorship?: () => void;
}) {
  const { user } = mentor;
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const primaryDomain = mentor.domains[0]
    ? EXPERTISE_STYLES[mentor.domains[0].domain.name]
    : Object.values(EXPERTISE_STYLES)[0];

  const canRequest = !mentor.mentorshipStatus || mentor.mentorshipStatus === "REJECTED" || mentor.mentorshipStatus === "CANCELLED";
  const statusConfig = mentor.mentorshipStatus && !canRequest ? STATUS_CONFIG[mentor.mentorshipStatus] : null;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="h-24 bg-gradient-brand sm:h-32" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
            <UserAvatar
              user={{ name: fullName, initials, avatarUrl: user.profilePicture ?? undefined }}
              accent={primaryDomain.accent}
              size="lg"
            />
            <div className="pb-1">
              <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
              <p className="text-sm text-muted-foreground">
                {mentor.profession ?? "Mentor"}
                {mentor.yearsOfExperience && ` · ${mentor.yearsOfExperience}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
              Mentor
            </span>
            {mentor.domains.map(({ domain }) => (
              <span key={domain.id} className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                {domain.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {mentor.menteeCount} mentoré{mentor.menteeCount > 1 ? "s" : ""} accompagné{mentor.menteeCount > 1 ? "s" : ""}
          </div>

          {statusConfig ? (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.className}`}>
              <statusConfig.icon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </span>
          ) : (
            <button
              type="button"
              onClick={onRequestMentorship}
              className="rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-110"
            >
              Demander un mentorat
            </button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {user.bio && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-foreground">À propos</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{user.bio}</p>
            </motion.section>
          )}

          {user.skills.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-foreground">Compétences</h3>
              <div className="mt-3">
                <SkillChips skills={user.skills.map((s) => s.skill.name)} />
              </div>
            </motion.section>
          )}

          {user.availabilities.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-foreground">Disponibilités</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.availabilities.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground">
                    <CalendarClock className="h-3 w-3 text-muted-foreground" />
                    {a.slot}
                  </span>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        <div className="space-y-6">
          <ProfileInfoCard
            city={user.city}
            country={user.country}
            languages={user.languages}
            socialLinks={user.socialLinks}
          />
        </div>
      </div>
    </div>
  );
}