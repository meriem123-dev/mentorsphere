import type { Mentor, MentorUser } from "./mentorTypes";

export type MentorshipStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export type MentorshipStage = "Idée" | "MVP" | "Seed" | "Croissance";

export interface MentorshipRequest {
  id: string;
  entrepreneurName: string;
  entrepreneurInitials: string;
  /** Contrôle la couleur de l'avatar */
  accentAvatar?: "blue" | "rose";
  projectName: string;
  /** Un des 14 domaines d'expertise définis dans expertise.ts */
  domain: string;
  stage: MentorshipStage;
  message: string;
  timeAgo: string;
  /** Score d'affinité 0-100 */
  compatibilityScore?: number;
}




export interface MentorshipStartup {
  id: string;
  name: string;
  stage: string;
  domain: string;
  description?: string;
}

export interface MentorshipEntrepreneur {
  id: string;
  user: MentorUser;
}

export interface Mentorship {
  id: string;
  status: MentorshipStatus;
  message: string | null;
  startupId: string | null;
  mentorId: string;
  entrepreneurId: string;
  createdAt: string;
  updatedAt: string;
  startup: MentorshipStartup | null;
  mentor?: Mentor;
  entrepreneur?: MentorshipEntrepreneur;
}

export interface CreateMentorshipPayload {
  mentorId: string;
  startupId: string;
  message: string;
}

export interface GetMentorsResponseWrapper {
  mentors: Mentor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type MenteeStatus = "actif" | "inactif";

export interface Mentee {
  mentorshipId: string;
  entrepreneurId: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  accent: "blue" | "rose";
  projectName: string;
  stage: string;
  status: MenteeStatus;
  lastSeenLabel: string;
  sessionsCount: number;
  progression: number; // 0-100
}

export type SortKey = "progression" | "recent" | "name";