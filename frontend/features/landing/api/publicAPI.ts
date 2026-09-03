import {api} from "@/lib/api";
import type { PlatformStats, GetTestimonialsResponse } from "@/types/publicTypes";

export const publicApi = {
  getStats: async (): Promise<PlatformStats> => {
    const res = await api.get<PlatformStats>("api/public/stats");
    return res.data;
  },

  getTestimonials: async (limit = 3): Promise<GetTestimonialsResponse> => {
    const res = await api.get<GetTestimonialsResponse>("api/public/testimonials", {
      params: { limit },
    });
    return res.data;
  },
};