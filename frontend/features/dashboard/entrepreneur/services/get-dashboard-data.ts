
import type {
  DashboardStats,
  WeeklyActivityPoint,
  AISuggestion,
  RecommendedMentor,
} from "@/types/dashTypes";

interface DashboardData {
  stats: DashboardStats;
  weeklyActivity: WeeklyActivityPoint[];
  aiSuggestions: AISuggestion[];
  recommendedMentors: RecommendedMentor[];
  parcours: { projectName: string; stage: string; progression: number };
}

export async function getDashboardData(): Promise<DashboardData> {
  return {
    stats: {
      activeProjects: 2,
      activeProjectsDelta: "+1 ce mois",
      mentorSessions: 14,
      mentorSessionsDelta: "+3 cette semaine",
      upcomingSessions: 2,
      nextSessionLabel: "Demain 15h00",
      progression: 68,
      progressionDelta: "+12% ce mois",
    },
    weeklyActivity: [
      { day: "Lun", sessions: 2, messages: 5 },
      { day: "Mar", sessions: 3, messages: 8 },
      { day: "Mer", sessions: 1, messages: 4 },
      { day: "Jeu", sessions: 4, messages: 10 },
      { day: "Ven", sessions: 2, messages: 6 },
      { day: "Sam", sessions: 1, messages: 2 },
      { day: "Dim", sessions: 0, messages: 1 },
    ],
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
    parcours: { projectName: "NovaPay", stage: "Seed", progression: 68 },
  };
}