import { api } from "@/lib/api";
import type { EntrepreneurEditProfile, MentorEditProfile } from "@/types/profile";

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  languages?: string[];
  domains?: string[];
  skills?: string[];
  profession?: string;
  level?: string;
  lookingFor?: string[];
  yearsOfExperience?: string;
  availability?: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  avatarColor?: string;
  removePhoto?: boolean;
  removeCv?: boolean;
  removeDocumentIds?: string[];
  photoFile?: File | null;
  cvFile?: File | null;
  documentFiles?: File[];
}

//construit le FormData commun aux deux rôles
function buildProfileFormData(payload: UpdateProfilePayload): FormData {
  const formData = new FormData();
  if (payload.firstName !== undefined)
  formData.append("firstName", payload.firstName);
if (payload.lastName !== undefined)
  formData.append("lastName", payload.lastName);

  if (payload.bio !== undefined) formData.append("bio", payload.bio);
  if (payload.birthDate !== undefined)
    formData.append("birthDate", payload.birthDate);
  if (payload.country !== undefined)
    formData.append("country", payload.country);
  if (payload.city !== undefined) formData.append("city", payload.city);
  if (payload.languages !== undefined)
    formData.append("languages", JSON.stringify(payload.languages));
  if (payload.domains !== undefined)
    formData.append("domains", JSON.stringify(payload.domains));
  if (payload.skills !== undefined)
    formData.append("skills", JSON.stringify(payload.skills));
  if (payload.profession !== undefined)
    formData.append("profession", payload.profession);
  if (payload.level !== undefined) formData.append("level", payload.level);
  if (payload.lookingFor !== undefined)
    formData.append("lookingFor", JSON.stringify(payload.lookingFor));
  if (payload.yearsOfExperience !== undefined)
    formData.append("yearsOfExperience", payload.yearsOfExperience);
  if (payload.availability !== undefined)
    formData.append("availability", JSON.stringify(payload.availability));
  if (payload.linkedin !== undefined)
    formData.append("linkedin", payload.linkedin);
  if (payload.github !== undefined) formData.append("github", payload.github);
  if (payload.portfolio !== undefined)
    formData.append("portfolio", payload.portfolio);
  if (payload.website !== undefined)
    formData.append("website", payload.website);
  if (payload.avatarColor !== undefined)
    formData.append("avatarColor", payload.avatarColor);
  if (payload.removePhoto !== undefined)
    formData.append("removePhoto", String(payload.removePhoto));
  if (payload.photoFile) formData.append("photo", payload.photoFile);
  if (payload.cvFile) formData.append("cv", payload.cvFile);
  if (payload.documentFiles) {
    payload.documentFiles.forEach((file) => formData.append("documents", file));
  }

  if (payload.removeCv !== undefined)
    formData.append("removeCv", String(payload.removeCv));
  if (payload.removeDocumentIds !== undefined)
    formData.append(
      "removeDocumentIds",
      JSON.stringify(payload.removeDocumentIds),
    );

  return formData;
}

export const profileApi = {
  async updateEntrepreneurProfile(payload: UpdateProfilePayload) {
    const formData = buildProfileFormData(payload);
    const res = await api.patch("/api/profile/entrepreneur", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async updateMentorProfile(payload: UpdateProfilePayload) {
    const formData = buildProfileFormData(payload);
    const res = await api.patch("/api/profile/mentor", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async updateEmail(newEmail: string, currentPassword: string) {
    const res = await api.patch("/api/auth/email", {
      newEmail,
      currentPassword,
    });
    return res.data;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const res = await api.patch("/api/auth/password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
async getMyProfile(): Promise<EntrepreneurEditProfile | MentorEditProfile> {
  const res = await api.get<{
    success: boolean;
    data: { profile: EntrepreneurEditProfile | MentorEditProfile };
  }>("/api/profile/me");
  return res.data.data.profile;
},
};
