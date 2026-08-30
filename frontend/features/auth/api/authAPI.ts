import { api } from "@/lib/api";
import {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  GoogleAuthPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ResendVerificationPayload,
  SimpleApiResponse,
} from "../../../types/authTypes";
import {
  MentorProfileFormData,
  ProfileFormData,
  ProfileCompletionResponse,
  MeResponse
} from "../../../types/authTypes";

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/api/auth/register", payload);
    return res.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/api/auth/login", payload);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout");
  },

  getMe: async (): Promise<MeResponse> => {
    const res = await api.get<MeResponse>("/api/auth/me");
    return res.data;
  },

  googleAuth: async (payload: GoogleAuthPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/api/auth/google", payload);
    return res.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<SimpleApiResponse> => {
    const res = await api.post<SimpleApiResponse>("/api/auth/forgot-password", payload);
    return res.data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<SimpleApiResponse> => {
    const res = await api.post<SimpleApiResponse>("/api/auth/reset-password", payload);
    return res.data;
  },

  resendVerification: async (payload: ResendVerificationPayload): Promise<SimpleApiResponse> => {
    const res = await api.post<SimpleApiResponse>("/api/auth/resend-verification", payload);
    return res.data;
  },

  verifyEmail: async (token: string): Promise<SimpleApiResponse> => {
    const res = await api.get<SimpleApiResponse>(`/api/auth/verify-email/${token}`);
    return res.data;
  },

  completeEntrepreneurProfile: async (
    payload: ProfileFormData,
  ): Promise<ProfileCompletionResponse> => {
    const formData = buildEntrepreneurFormData(payload);
    const res = await api.post<ProfileCompletionResponse>(
      "/api/profile/entrepreneur/complete",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },

  completeMentorProfile: async (
    payload: MentorProfileFormData,
  ): Promise<ProfileCompletionResponse> => {
    const formData = buildMentorFormData(payload);
    const res = await api.post<ProfileCompletionResponse>(
      "/api/profile/mentor/complete",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },
};

//convertit le formData entrepreneur (typé) en FormData multipart
function buildEntrepreneurFormData(payload: ProfileFormData): FormData {
  const fd = new FormData();

  fd.append("bio", payload.bio);
  fd.append("birthDate", payload.birthDate);
  fd.append("country", payload.country);
  fd.append("city", payload.city);
  fd.append("languages", JSON.stringify(payload.languages));
  fd.append("domains", JSON.stringify(payload.domains));
  fd.append("skills", JSON.stringify(payload.skills));
  fd.append("profession", payload.profession);
  fd.append("level", payload.level);
  fd.append("lookingFor", JSON.stringify(payload.lookingFor));
  fd.append("availability", JSON.stringify(payload.availability));
  fd.append("linkedin", payload.linkedin);
  fd.append("github", payload.github);
  fd.append("portfolio", payload.portfolio);

   if (payload.avatarColor) {
    fd.append("avatarColor", payload.avatarColor);
  }

  if (payload.photo) {
    fd.append("photo", payload.photo);
  }
  if (payload.cv) {
    fd.append("cv", payload.cv);
  }
  payload.documents.forEach((doc) => {
    fd.append("documents", doc);
  });

  return fd;
}
//convertit le formData mentor (typé) en FormData multipart
function buildMentorFormData(payload: MentorProfileFormData): FormData {
  const fd = new FormData();

  fd.append("bio", payload.bio);
  fd.append("birthDate", payload.birthDate);
  fd.append("country", payload.country);
  fd.append("city", payload.city);
  fd.append("languages", JSON.stringify(payload.languages));
  fd.append("domains", JSON.stringify(payload.domains));
  fd.append("skills", JSON.stringify(payload.skills));
  fd.append("profession", payload.profession);
  fd.append("yearsOfExperience", payload.yearsOfExperience);
  fd.append("availability", JSON.stringify(payload.availability));
  fd.append("linkedin", payload.linkedin);
  fd.append("github", payload.github);
  fd.append("portfolio", payload.portfolio);
  fd.append("website", payload.website);

  if (payload.avatarColor) {
    fd.append("avatarColor", payload.avatarColor);
  }

  if (payload.photo) {
    fd.append("photo", payload.photo);
  }
  if (payload.cv) {
    fd.append("cv", payload.cv);
  }
  payload.documents.forEach((doc) => {
    fd.append("documents", doc);
  });

  return fd;
}