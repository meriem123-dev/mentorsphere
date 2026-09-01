import type { AISuggestion, RecommendedMentor } from "@/types/dashTypes";
import { dashboardApi, type ParcoursData } from "../api/dashboardAPI";

interface DashboardData {
  stats: Awaited<ReturnType<typeof dashboardApi.getStats>>;
  weeklyActivity: Awaited<ReturnType<typeof dashboardApi.getWeeklyActivity>>;
  aiSuggestions: AISuggestion[];
  recommendedMentors: RecommendedMentor[];
  parcours: ParcoursData;
}

export async function getDashboardData(startupId?: string): Promise<DashboardData> {
  const [stats, weeklyActivity, parcours] = await Promise.all([
    dashboardApi.getStats(),
    dashboardApi.getWeeklyActivity(),
    dashboardApi.getParcours(startupId),
  ]);


  return {
    stats,
    weeklyActivity,
    aiSuggestions: [
      { id: "1", text: "Votre pitch deck manque une section sur la défensibilité." },
      { id: "2", text: "Envisagez un palier freemium — 67% de votre cible préfère le self-serve." },
      { id: "3", text: "Sarah Chen a 2 créneaux libres cette semaine." },
    ],
    recommendedMentors: [
      { id: "1", name: "Sarah Chen", title: "Ex-Google PM", initials: "SC" },
      { id: "2", name: "Marcus Reid", title: "Serial Founder", initials: "MR" },
      { id: "3", name: "Aisha Patel", title: "VC Partner", initials: "AP" },
    ],
    parcours,
  };
}