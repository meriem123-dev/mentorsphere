"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Calendar, Star as StarIcon, TrendingUp } from "lucide-react";
import { StatsGrid } from "@/features/dashboard/mentor/components/stats-grid";
import { SessionsActivityChart } from "@/features/dashboard/mentor/components/sessions-activity-chart";
import { MenteeProgressCard } from "@/features/dashboard/mentor/components/mentor-progress-card";
import { UpcomingSessionsCard } from "@/features/dashboard/mentor/components/upcoming-sessions-card";
import { RecentFeedbackCard } from "@/features/dashboard/mentor/components/recent-feedback-card";
import { mentorDashboardApi } from "@/features/dashboard/mentor/api/dashboardMentorAPI";
import { STATIC_FEEDBACKS, STATIC_AVERAGE_RATING, STATIC_AVERAGE_RATING_DELTA } from "@/features/dashboard/mentor/data/static-data";
import type {
  MentorDashboardStats,
  SessionActivityPoint,
  MenteeProgress,
  UpcomingSession,
  StatCardData,
} from "@/types/dashTypes";

interface MentorDashboardState {
  stats: MentorDashboardStats | null;
  activity: SessionActivityPoint[];
  mentees: MenteeProgress[];
  sessions: UpcomingSession[];
}

function buildStatCards(stats: MentorDashboardStats): StatCardData[] {
  return [
    {
      icon: Users,
      label: "Mentorés Actifs",
      value: String(stats.activeMentees),
      delta: stats.activeMenteesDelta,
      accent: "rose",
    },
    {
      icon: Calendar,
      label: "Sessions finalisées",
      value: String(stats.sessionsCompleted),
      delta: stats.sessionsDelta,
      accent: "blue",
    },
    {
      icon: StarIcon,
      label: "Note Moyenne",
      value: STATIC_AVERAGE_RATING,
      delta: STATIC_AVERAGE_RATING_DELTA,
      accent: "rose",
    },
    {
      icon: TrendingUp,
      label: "Taux de Réussite",
      value: `${stats.successRate}%`,
      delta: stats.successRateDelta,
      accent: "green",
    },
  ];
}

export default function MentorDashboardPage() {
  const [data, setData] = useState<MentorDashboardState>({
    stats: null,
    activity: [],
    mentees: [],
    sessions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [stats, mentees, activity, sessions] = await Promise.all([
          mentorDashboardApi.getStats(),
          mentorDashboardApi.getMenteesProgress(),
          mentorDashboardApi.getSessionsActivity(),
          mentorDashboardApi.getUpcomingSessions(),
        ]);

        if (cancelled) return;

        setData({ stats, mentees, activity, sessions });
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          toast.error("Impossible de charger le tableau de bord");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data.stats) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <StatsGrid stats={buildStatCards(data.stats)} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SessionsActivityChart data={data.activity} />
        <MenteeProgressCard mentees={data.mentees} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingSessionsCard sessions={data.sessions} />
        <RecentFeedbackCard feedbacks={STATIC_FEEDBACKS} />
      </div>
    </div>
  );
}