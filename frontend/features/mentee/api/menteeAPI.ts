import { api } from "@/lib/api";

export interface MenteeApiResponse {
  mentorshipId: string;
  entrepreneur: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture: string | null;
      isActive: boolean;
    };
  };
  startup: {
    id: string;
    name: string;
    stage: "IDEE" | "MVP" | "SEED" | "CROISSANCE";
  } | null;
  progression: number;
  lastInteractionAt: string;
  sessionsCount: number;
}

export const menteeApi = {
  getMentees: async (): Promise<{ mentees: MenteeApiResponse[] }> => {
    const res = await api.get<{ mentees: MenteeApiResponse[] }>(
      "/api/mentorship/mentees",
    );
    return res.data;
  },
};