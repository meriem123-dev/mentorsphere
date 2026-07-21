"use client";

import { motion } from "framer-motion";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EXPERTISE_STYLES } from "@/lib/expertise";
import { ProfileInfoCard } from "@/features/profile/components/ProfileInfoCard";
import { SkillChips } from "@/features/profile/components/SkillChips";
import { StartupProgressCard } from "@/features/profile/components/StartupProgressCard";
import { StageBadge } from "@/features/profile/components/StageBadge";
import type { EntrepreneurProfile } from "@/types/entrepreneurTypes";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground">{children}</h3>
      <span className="mt-1.5 block h-0.5 w-8 rounded-full bg-brand-rose" />
    </div>
  );
}

const FALLBACK_DOMAIN_STYLE = Object.values(EXPERTISE_STYLES)[0];

// dot = "bg-brand-blue" -> badge en version douce "bg-brand-blue/10 text-brand-blue"
function getDomainBadgeClasses(dot: string) {
  const token = dot.replace(/^bg-/, "");
  return { bg: `bg-${token}/10`, text: `text-${token}` };
}

export function EntrepreneurProfileView({ entrepreneur }: { entrepreneur: EntrepreneurProfile }) {
  const { user } = entrepreneur;
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const primaryDomain =
    (entrepreneur.domains[0] && EXPERTISE_STYLES[entrepreneur.domains[0].domain.name]) ??
    FALLBACK_DOMAIN_STYLE;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <UserAvatar
            user={{ name: fullName, initials, avatarUrl: user.profilePicture ?? undefined }}
            accent={primaryDomain.accent}
            size="lg"
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {entrepreneur.profession ?? "Entrepreneur"}
              {entrepreneur.startups[0] && ` · ${entrepreneur.startups[0].name}`}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white">
                Entrepreneur
              </span>
              {entrepreneur.startups[0] && (
                <StageBadge stage={entrepreneur.startups[0].stage} />
              )}
              {entrepreneur.domains.map(({ domain }) => {
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

          {entrepreneur.startups.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <SectionTitle>
                {entrepreneur.startups.length > 1 ? "Mes Startups" : "Mon Startup"}
              </SectionTitle>
              <div className="mt-3 space-y-3">
                {entrepreneur.startups.map((startup) => (
                  <StartupProgressCard key={startup.id} startup={startup} />
                ))}
              </div>
            </motion.section>
          )}
        </div>

        <div className="space-y-6">
          {entrepreneur.lookingFor.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <SectionTitle>Recherche</SectionTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                {entrepreneur.lookingFor.map((need) => (
                  <span
                    key={need}
                    className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success"
                  >
                    {need}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
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