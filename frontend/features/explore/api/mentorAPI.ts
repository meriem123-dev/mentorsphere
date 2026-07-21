import { api } from "@/lib/api";
import type {
  Mentor,
  GetMentorsResponse,
  GetMentorsParams,
  MentorProfile,
} from "../../../types/mentorTypes";
import type {
  EntrepreneurProfile,
  GetEntrepreneursParams,
  GetEntrepreneursResponse,
} from "@/types/entrepreneurTypes";

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
  getById: async (
    id: string,
    config?: Parameters<typeof api.get>[1],
  ): Promise<{ mentor: MentorProfile }> => {
    const res = await api.get<{ mentor: MentorProfile }>(
      `/api/mentorship/mentors/${id}`,
      config,
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
    config?: Parameters<typeof api.get>[1],
  ): Promise<{ entrepreneur: EntrepreneurProfile }> => {
    const res = await api.get<{ entrepreneur: EntrepreneurProfile }>(
      `/api/mentorship/entrepreneurs/${id}`,
      config,
    );
    return res.data;
  },
};