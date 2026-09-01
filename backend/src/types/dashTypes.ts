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

export interface RecommendedMentor {
  id: string;
  name: string;
  title: string;
  initials: string;
  avatarUrl?: string;
}

export interface AISuggestion {
  id: string;
  text: string;
}

export interface MentorDashboardStats {
  activeMentees: number;
  activeMenteesDelta: string;
  sessionsCompleted: number;
  sessionsDelta: string;
  successRate: number;
  successRateDelta: string;
  upcomingSessionsCount: number;
  nextSessionLabel: string;
}