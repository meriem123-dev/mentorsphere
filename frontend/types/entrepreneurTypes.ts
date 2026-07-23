import type { ExpertiseDomain } from "@/lib/expertise";
export interface EntrepreneurUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  coverPicture: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
}

export interface EntrepreneurDomainItem {
  domain: { id: string; name: string };
}

export interface Entrepreneur {
  id: string;
  profession: string | null;
  level: string | null;
  lookingFor: string[];
  user: EntrepreneurUser;
  domains: EntrepreneurDomainItem[];
}

export interface GetEntrepreneursResponse {
  entrepreneurs: Entrepreneur[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetEntrepreneursParams {
  search?: string;
  domain?: string;
  page?: number;
  pageSize?: number;
}



export type ProjectStage = "IDEE" | "MVP" | "SEED" | "CROISSANCE";

export interface StartupSummary {
  id: string;
  name: string;
  description: string;
  stage: ProjectStage;
  domain: string;
  needs: string[];
  isRecruiting: boolean;
  progress: number;
}

export interface EntrepreneurProfile {
  id: string;
  profession: string | null;
  level: string | null;
  lookingFor: string[];
  mentorshipStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | null;
  domains: { domain: { id: string; name: ExpertiseDomain } }[];
  startups: StartupSummary[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    birthDate: string | null;
    profilePicture: string | null;
    coverPicture: string | null;
    city: string | null;
    country: string | null;
    languages: { language: { id: string; name: string } }[];
    skills: { skill: { id: string; name: string } }[];
    socialLinks: { id: string; platform: string; url: string }[];
  };
}