import { ExpertiseDomain } from "@/lib/expertise";
export interface MentorUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  coverPicture: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
}

export interface MentorDomainItem {
  domain: { id: string; name: string };
}

export interface MentorshipRequestSummary {
  startupId: string | null;
  status: "PENDING" | "ACCEPTED";
}

export interface Mentor {
  id: string;
  profession: string | null;
  yearsOfExperience: string | null;
  user: MentorUser;
  domains: MentorDomainItem[];
  mentorships: { id: string }[];
  mentorshipStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | null;
  myMentorshipRequests?: MentorshipRequestSummary[];
}

export interface GetMentorsResponse {
  mentors: Mentor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetMentorsParams {
  search?: string;
  domain?: string;
  page?: number;
  pageSize?: number;
}

export interface MentorProfile {
  id: string;
  profession: string | null;
  yearsOfExperience: string | null;
  menteeCount: number;
  mentorshipStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | null;
  domains: { domain: { id: string; name: ExpertiseDomain } }[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profilePicture: string | null;
    coverPicture: string | null;
    city: string | null;
    country: string | null;
    languages: { language: { id: string; name: string } }[];
    skills: { skill: { id: string; name: string } }[];
    availabilities: { id: string; slot: string }[];
    socialLinks: { id: string; platform: string; url: string }[];
  };
}