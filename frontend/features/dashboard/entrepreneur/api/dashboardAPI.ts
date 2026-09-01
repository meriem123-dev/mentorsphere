import { api } from "@/lib/api";
import type { DashboardStats, WeeklyActivityPoint,AISuggestion,AIGenerationOutcome,AIGenerationState,MentorMatchesResult } from "@/types/dashTypes";

export interface StartupListItem {
  id: string;
  name: string;
  stage: string;
  createdAt: string;
}

export interface ParcoursData {
  startupId: string | null;
  projectName: string;
  stage: string;
  progression: number;
}

export interface MentorshipListItem {
  id: string;
  mentorName: string;
  startupName: string | null;
}

export interface DashboardSuggestionsState {
  result: AISuggestion[];
  attemptsRemaining: number;
  windowResetAt: string | null;
}

export interface DashboardSuggestionsOutcome extends DashboardSuggestionsState {
  limitReached: boolean;
}

export const dashboardApi = {
  getStats: () =>
    api.get<DashboardStats>("api/dashboard/entrepreneur/stats").then((r) => r.data),

  getParcours: (startupId?: string) =>
    api
      .get<ParcoursData>("api/dashboard/entrepreneur/parcours", {
        params: startupId ? { startupId } : {},
      })
      .then((r) => r.data),

  getStartupsList: () =>
    api.get<StartupListItem[]>("api/dashboard/entrepreneur/startups").then((r) => r.data),

  getWeeklyActivity: () =>
    api.get<WeeklyActivityPoint[]>("api/dashboard/entrepreneur/weekly-activity").then((r) => r.data),

  getMentorships: () =>
    api.get<MentorshipListItem[]>("api/dashboard/entrepreneur/mentorships").then((r) => r.data),

  getSuggestionsState: (mentorshipId: string) =>
    api
      .get<DashboardSuggestionsState>("api/dashboard/entrepreneur/suggestions", {
        params: { mentorshipId },
      })
      .then((r) => r.data),

  generateSuggestions: (mentorshipId: string) =>
    api
      .post<DashboardSuggestionsOutcome>("api/dashboard/entrepreneur/suggestions/generate", {
        mentorshipId,
      })
      .then((r) => r.data),

  getMentorMatchesState: (mentorshipId: string) =>
    api
      .get<AIGenerationState<MentorMatchesResult>>("api/dashboard/entrepreneur/mentor-matches", {
        params: { mentorshipId },
      })
      .then((r) => r.data),

  generateMentorMatches: (mentorshipId: string) =>
    api
      .post<AIGenerationOutcome<MentorMatchesResult>>(
        "api/dashboard/entrepreneur/mentor-matches/generate",
        { mentorshipId }
      )
      .then((r) => r.data),
};