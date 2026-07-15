import { api } from "@/lib/api";
import {
  StartupPayload,
  UpdateStartupPayload,
  StartupResponse,
  StartupsListResponse,
  DeleteStartupResponse,
} from "../../../types/startupTypes";


//api recup
export const startupApi = {
  create: async (payload: StartupPayload): Promise<StartupResponse> => {
    const res = await api.post<StartupResponse>("/api/startups", payload);
    return res.data;
  },

  //api les miennes
  getMine: async (): Promise<StartupsListResponse> => {
    const res = await api.get<StartupsListResponse>("/api/startups/mine");
    return res.data;
  },

  //api modif
  update: async (
    id: string,
    payload: UpdateStartupPayload,
  ): Promise<StartupResponse> => {
    const res = await api.patch<StartupResponse>(`/api/startups/${id}`, payload);
    return res.data;
  },

  //api supp
  remove: async (id: string): Promise<DeleteStartupResponse> => {
    const res = await api.delete<DeleteStartupResponse>(`/api/startups/${id}`);
    return res.data;
  },
};