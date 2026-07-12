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