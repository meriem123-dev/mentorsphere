"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Calendar, Star as StarIcon, TrendingUp } from "lucide-react";
import { StatsGrid } from "@/features/dashboard/mentor/components/stats-grid";
import { SessionsActivityChart } from "@/features/dashboard/mentor/components/sessions-activity-chart";
import { MenteeProgressCard } from "@/features/dashboard/mentor/components/mentor-progress-card";
import { UpcomingSessionsCard } from "@/features/dashboard/mentor/components/upcoming-sessions-card";
import { RecentFeedbackCard } from "@/features/dashboard/mentor/components/recent-feedback-card";
import { mentorDashboardApi } from "@/features/dashboard/mentor/api/dashboardMentorAPI";
import type {
  MentorDashboardStats,
  SessionActivityPoint,
  MenteeProgress,
  UpcomingSession,
  StatCardData,
  Feedback,
} from "@/types/dashTypes";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";

interface MentorDashboardState {
  stats: MentorDashboardStats | null;
  activity: SessionActivityPoint[];
  mentees: MenteeProgress[];
  sessions: UpcomingSession[];
  feedbacks: Feedback[];
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
      value: stats.averageRating,
      delta: stats.averageRatingDelta,
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
    feedbacks: [],
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function handleJoinSession(mentorshipId: string, sessionId: string) {
    try {
      await workspaceApi.getSessionRoomCredentials(mentorshipId, sessionId);
      router.push(`/mentor/workspace/${mentorshipId}/sessions/${sessionId}/room`);
    } catch (err) {
      toast.error("Impossible de rejoindre la session");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [stats, mentees, activity, sessions, feedbacks] = await Promise.all([
          mentorDashboardApi.getStats(),
          mentorDashboardApi.getMenteesProgress(),
          mentorDashboardApi.getSessionsActivity(),
          mentorDashboardApi.getUpcomingSessions(),
          mentorDashboardApi.getRecentFeedbacks(),
        ]);

        if (cancelled) return;

        setData({ stats, mentees, activity, sessions, feedbacks });
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
        <UpcomingSessionsCard sessions={data.sessions} onJoinSession={handleJoinSession} />
        <RecentFeedbackCard feedbacks={data.feedbacks} />
      </div>
    </div>
  );
}