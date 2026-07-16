
import { api } from "@/lib/api";
import type {
  Mentor,
  GetMentorsResponse,
  GetMentorsParams,
} from "../../../types/mentorTypes";

export const mentorApi = {
  // liste + filtres (recherche, domaine, pagination)
  getMentors: async (params?: GetMentorsParams): Promise<GetMentorsResponse> => {
    const res = await api.get<GetMentorsResponse>("/api/mentorship/mentors", { params });
    return res.data;
  },

  // détail d'un mentor
  getById: async (id: string): Promise<{ mentor: Mentor }> => {
    const res = await api.get<{ mentor: Mentor }>(`/api/mentorship/mentors/${id}`);
    return res.data;
  },
};