// features/dashboard/entrepreneur/types.ts

export interface DashboardStats {
  activeProjects: number;
  activeProjectsDelta: string;
  mentorSessions: number;
  mentorSessionsDelta: string;
  upcomingSessions: number;
  nextSessionLabel: string;
  progression: number;
  progressionDelta: string;
}

export interface WeeklyActivityPoint {
  day: string;
  sessions: number;
  messages: number;
}

export interface AISuggestion {
  id: string;
  text: string;
}

export interface RecommendedMentor {
  id: string;
  name: string;
  title: string;
  initials: string;
  avatarUrl?: string;
}