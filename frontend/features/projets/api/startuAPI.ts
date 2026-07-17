import { api } from "@/lib/api";
import {
  StartupPayload,
  UpdateStartupPayload,
  StartupResponse,
  StartupsListResponse,
  DeleteStartupResponse,
  Startup,
  GetStartupResponse
} from "../../../types/startupTypes";


export const startupApi = {
  //création
  create: async (payload: StartupPayload): Promise<StartupResponse> => {
    const res = await api.post<StartupResponse>("/api/startups", payload);
    return res.data;
  },

  //api recup mine
  getMine: async (): Promise<StartupsListResponse> => {
    const res = await api.get<StartupsListResponse>("/api/startups/mine");
    return res.data;
  },

  //api tous les projets publics
  getPublic: async (): Promise<StartupsListResponse> => {
    const res = await api.get<StartupsListResponse>("/api/startups/public");
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

  //api demande pour rejoindre un projet
  join: async (id: string, message?: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.post(`/api/startups/${id}/join`, { message });
    return res.data;
  },
  
  //api récup une startup (owner ou publique)
  getById: async (id: string): Promise<GetStartupResponse> => {
    const res = await api.get<GetStartupResponse>(`/api/startups/${id}`);
    return res.data;
  },


};