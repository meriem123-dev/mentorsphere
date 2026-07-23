import type { EntrepreneurProfile } from "@/types/entrepreneurTypes";

export type Role = "entrepreneur" | "mentor";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileCompletionResponse {
  success: boolean;
  message: string;
  data: { user: User };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ENTREPRENEUR" | "MENTOR" | "ADMIN";
  profilePicture: string | null;
  coverPicture?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  profileCompleted: boolean;
}

export interface ProfileCompletionResponse {
  success: boolean;
  message: string;
  data: { user: User };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
}
//base user puis héritage
export interface BaseProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  birthDate: string;
  country: string;
  city: string;
  languages: string[];
  photo: File | null;
  avatarColor?: string;
  removePhoto?: boolean;
}

//type entrepreneur
export interface ProfileFormData extends BaseProfileFormData {
  profession: string;
  level: string;
  domains: string[];
  skills: string[];

  // Recherche & Disponibilités
  lookingFor: string[];
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  availability: string[];
  cv: File | null;
  documents: File[];
}

export type SetProfileFormData = (data: ProfileFormData) => void;

//type Mentor
export interface MentorProfileFormData extends BaseProfileFormData {
  // étape 2
  profession: string;
  yearsOfExperience: string;
  domains: string[];
  skills: string[];
  // étape 3
  availability: string[];
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  cv: File | null;

  documents: File[];
}

