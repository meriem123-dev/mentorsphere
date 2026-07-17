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