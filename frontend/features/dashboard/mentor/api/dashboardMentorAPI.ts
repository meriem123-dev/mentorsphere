import { api } from "@/lib/api";
import type {
  MentorDashboardStats,
  MenteeProgress,
  SessionActivityPoint,
  UpcomingSession,
} from "@/types/dashTypes";

export const mentorDashboardApi = {
  getStats: () =>
    api.get<MentorDashboardStats>("api/dashboard/mentor/stats").then((r) => r.data),

  getMenteesProgress: () =>
    api.get<MenteeProgress[]>("api/dashboard/mentor/mentees-progress").then((r) => r.data),

  getSessionsActivity: () =>
    api.get<SessionActivityPoint[]>("api/dashboard/mentor/sessions-activity").then((r) => r.data),

  getUpcomingSessions: () =>
    api.get<UpcomingSession[]>("api/dashboard/mentor/upcoming-sessions").then((r) => r.data),
};