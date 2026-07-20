"use client";

import { motion } from "framer-motion";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EXPERTISE_STYLES } from "@/lib/expertise";
import { ProfileInfoCard } from "@/features/profile/components/ProfileInfoCard";
import { SkillChips } from "@/features/profile/components/SkillChips";
import { StartupProgressCard } from "@/features/profile/components/StartupProgressCard";
import type { EntrepreneurProfile } from "@/types/entrepreneurTypes";

export function EntrepreneurProfileView({ entrepreneur }: { entrepreneur: EntrepreneurProfile }) {
  const { user } = entrepreneur;
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const primaryDomain = entrepreneur.domains[0]
    ? EXPERTISE_STYLES[entrepreneur.domains[0].domain.name]
    : Object.values(EXPERTISE_STYLES)[0];

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
              size="lg"
            />
            <div className="pb-1">
              <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
              <p className="text-sm text-muted-foreground">
                {entrepreneur.profession ?? "Entrepreneur"}
                {entrepreneur.startups[0] && ` · ${entrepreneur.startups[0].name}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <span className="rounded-full bg-brand-rose/10 px-2.5 py-1 text-xs font-medium text-brand-rose">
              Entrepreneur
            </span>
            {entrepreneur.domains.map(({ domain }) => (
              <span key={domain.id} className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                {domain.name}
              </span>
            ))}
          </div>
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

          {entrepreneur.startups.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-foreground">
                Startup{entrepreneur.startups.length > 1 ? "s" : ""}
              </h3>
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
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground">Recherche</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {entrepreneur.lookingFor.map((need) => (
                  <span key={need} className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    {need}
                  </span>
                ))}
              </div>
            </div>
          )}

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