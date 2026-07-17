import { api } from "@/lib/api";
import type {
  Mentor,
  GetMentorsResponse,
  GetMentorsParams,
} from "../../../types/mentorTypes";
import type { Entrepreneur,GetEntrepreneursParams,GetEntrepreneursResponse } from "@/types/entrepreneurTypes";

export const mentorApi = {
  // liste + filtres (recherche, domaine, pagination)
  getMentors: async (
    params?: GetMentorsParams,
  ): Promise<GetMentorsResponse> => {
    const res = await api.get<GetMentorsResponse>("/api/mentorship/mentors", {
      params,
    });
    return res.data;
  },

  // détail d'un mentor
  getById: async (id: string): Promise<{ mentor: Mentor }> => {
    const res = await api.get<{ mentor: Mentor }>(
      `/api/mentorship/mentors/${id}`,
    );
    return res.data;
  },

  getEntrepreneurs: async (
    params?: GetEntrepreneursParams,
  ): Promise<GetEntrepreneursResponse> => {
    const res = await api.get<GetEntrepreneursResponse>(
      "/api/mentorship/entrepreneurs",
      { params },
    );
    return res.data;
  },

  getByIdEntrep: async (
    id: string,
  ): Promise<{ entrepreneur: Entrepreneur }> => {
    const res = await api.get<{ entrepreneur: Entrepreneur }>(
      `/api/mentorship/entrepreneurs/${id}`,
    );
    return res.data;
  },
};
