"use client"

import { Rocket, Users, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "./stat-card";
import type { DashboardStats } from "@/types/dashTypes";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Projets Actifs"
        value={stats.activeProjects}
        delta={stats.activeProjectsDelta}
        Icon={Rocket}
        IconBg="bg-[#13496B]"
      />
      <StatCard
        label="Sessions Mentor"
        value={stats.mentorSessions}
        delta={stats.mentorSessionsDelta}
        Icon={Users}
        IconBg="bg-brand-blue-light"
      />
      <StatCard
        label="Prochaines Sessions"
        value={stats.upcomingSessions}
        delta={stats.nextSessionLabel}
        deltaTone="neutral"
        Icon={Clock}
        IconBg="bg-brand-rose"
      />
      <StatCard
        label="Progression"
        value={`${stats.progression}%`}
        delta={stats.progressionDelta}
        Icon={TrendingUp}
        IconBg="bg-brand-rose-light"
      />
    </div>
  );
}