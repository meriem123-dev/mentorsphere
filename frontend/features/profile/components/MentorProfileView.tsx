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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground">{children}</h3>
      <span className="mt-1.5 block h-0.5 w-8 rounded-full bg-brand-rose" />
    </div>
  );
}

const FALLBACK_DOMAIN_STYLE = Object.values(EXPERTISE_STYLES)[0];

// dot = "bg-brand-blue" -> badge doux "bg-brand-blue/10 text-brand-blue"
function getDomainBadgeClasses(dot: string) {
  const token = dot.replace(/^bg-/, "");
  return { bg: `bg-${token}/10`, text: `text-${token}` };
}

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
  const primaryDomain =
    (mentor.domains[0] && EXPERTISE_STYLES[mentor.domains[0].domain.name]) ?? FALLBACK_DOMAIN_STYLE;

  const canRequest = !mentor.mentorshipStatus || mentor.mentorshipStatus === "REJECTED" || mentor.mentorshipStatus === "CANCELLED";
  const statusConfig = mentor.mentorshipStatus && !canRequest ? STATUS_CONFIG[mentor.mentorshipStatus] : null;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <UserAvatar
              user={{ name: fullName, initials, avatarUrl: user.profilePicture ?? undefined }}
              accent={primaryDomain.accent}
              size="lg"
            />
            <div className="min-w-0 pt-0.5">
              <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
              <p className="text-sm text-muted-foreground">
                {mentor.profession ?? "Mentor"}
                {mentor.yearsOfExperience && ` · ${mentor.yearsOfExperience}`} ans
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white">
                  Mentor
                </span>
                {mentor.domains.map(({ domain }) => {
                  const style = EXPERTISE_STYLES[domain.name] ?? FALLBACK_DOMAIN_STYLE;
                  const Icon = style.icon;
                  const { bg, text } = getDomainBadgeClasses(style.dot);
                  return (
                    <span
                      key={domain.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}
                    >
                      <Icon className="h-3 w-3" />
                      {domain.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground sm:pt-0.5">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {mentor.menteeCount} mentoré{mentor.menteeCount > 1 ? "s" : ""} accompagné{mentor.menteeCount > 1 ? "s" : ""}
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-border pt-4">
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
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {user.bio && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <SectionTitle>À propos</SectionTitle>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{user.bio}</p>
            </motion.section>
          )}

          {user.skills.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <SectionTitle>Compétences</SectionTitle>
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
              <SectionTitle>Disponibilités</SectionTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.availabilities.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-3 py-1.5 text-xs font-medium text-info">
                    <CalendarClock className="h-3 w-3" />
                    {a.slot}
                  </span>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ProfileInfoCard
              city={user.city}
              country={user.country}
              languages={user.languages}
              socialLinks={user.socialLinks}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}