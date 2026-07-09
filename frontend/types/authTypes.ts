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
//base user puis héritage
export interface BaseProfileFormData {
  bio: string;
  birthDate: string;
  country: string;
  city: string;
  languages: string[];
  photo: File | null;
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