import type { LucideIcon } from "lucide-react";

export type Accent = "rose" | "blue" | "green";

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

export interface StatCardData {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  accent: Accent;
}

export interface SessionActivityPoint {
  day: string;
  sessions: number;
}

export interface MenteeProgress {
  id: string;
  name: string;
  progress: number;
  accent: Accent;
}

export interface UpcomingSession {
  id: string;
  menteeName: string;
  mentorshipId: string;
  initials: string;
  topic: string;
  when: string;
  accent: Accent;
}

export interface Feedback {
  id: string;
  menteeName: string;
  initials: string;
  rating: number;
  quote: string;
  accent: Accent;
}

export interface RecommendedMentor {
  id: string;
  name: string;
  title: string;
  initials: string;
  avatarUrl?: string;
  requestedStartupIds?: string[];
  hasRequestedAll?: boolean;
}

export interface AISuggestion {
  id: string;
  text: string;
}

export interface AIGenerationState<T> {
  result: T | null;
  attemptsRemaining: number;
  windowResetAt: string | null;
}

export interface AIGenerationOutcome<T> extends AIGenerationState<T> {
  result: T;
  limitReached: boolean;
}

export interface MentorMatch {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  description: string;
  tags: string[];
  matchScore: number;
  availability: "available" | "busy";
  avatarUrl?: string;
}

export interface MentorMatchesResult {
  matches: MentorMatch[];
  generatedAt: string;
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
  averageRating: string;
  averageRatingDelta: string;
}
