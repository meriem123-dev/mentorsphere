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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ENTREPRENEUR" | "MENTOR";
  profilePicture: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface ProfileFormData {
  // À propos
  bio: string;
  birthDate: string;
  country: string;
  city: string;
  languages: string[];

  // Parcours entrepreneurial
  profession: string;
  level: string;
  domains: string[];
  skills: string[];

  // Photo
  photo: string | null;

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