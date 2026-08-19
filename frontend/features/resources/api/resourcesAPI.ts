import { api } from "@/lib/api";
import type { ResourceType, RawResourceFromApi } from "../../../types/resourceTypes";

export const resourcesApi = {
  list: (params?: {
    type?: Uppercase<ResourceType>;
    search?: string;
    savedOnly?: boolean;
    page?: number;
    limit?: number;
  }) =>
    api.get<{ resources: RawResourceFromApi[]; total: number; page: number; limit: number }>(
      "api/resources",
      { params }
    ),

  create: (formData: FormData) =>
    api.post<RawResourceFromApi>("api/resources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  toggleSave: (id: string) => api.post<{ isSaved: boolean }>(`api/resources/${id}/save`),

  remove: (id: string) => api.delete(`api/resources/${id}`),
};