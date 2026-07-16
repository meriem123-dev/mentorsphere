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

export interface Mentor {
  id: string;
  profession: string | null;
  yearsOfExperience: string | null;
  user: MentorUser;
  domains: MentorDomainItem[];
  mentorships: { id: string }[]; // mentorats ACCEPTED, pour compter les mentorés
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