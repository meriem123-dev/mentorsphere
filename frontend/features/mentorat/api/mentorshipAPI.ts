// frontend/features/mentorship/api/mentorshipApi.ts
import { api } from "@/lib/api";
import type {
  Mentorship,
  CreateMentorshipPayload,
} from "../../../types/mentoratTypes";

export const mentorshipApi = {
  // envoyer une demande (entrepreneur)
  create: async (payload: CreateMentorshipPayload): Promise<{ mentorship: Mentorship }> => {
    const res = await api.post<{ mentorship: Mentorship }>("/api/mentorship", payload);
    return res.data;
  },

  // demandes reçues (mentor)
  getReceived: async (status?: string): Promise<{ requests: Mentorship[] }> => {
    const res = await api.get<{ requests: Mentorship[] }>("/api/mentorship/received", {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  // demandes envoyées (entrepreneur)
  getSent: async (): Promise<{ requests: Mentorship[] }> => {
    const res = await api.get<{ requests: Mentorship[] }>("/api/mentorship/sent");
    return res.data;
  },

  // accepter / refuser une demande (mentor)
  respond: async (
    id: string,
    accept: boolean,
  ): Promise<{ mentorship: Mentorship }> => {
    const res = await api.patch<{ mentorship: Mentorship }>(
      `/api/mentorship/${id}/respond`,
      { accept },
    );
    return res.data;
  },
};