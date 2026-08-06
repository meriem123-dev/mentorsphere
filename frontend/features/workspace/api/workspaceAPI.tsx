import { api } from "@/lib/api";

import type {
  WorkspaceOverview,
  WorkspaceSummary,
  WorkspaceMessage,
  Objective,
  WorkspaceDocument
} from "@/types/workspaceTypes";

export const workspaceApi = {
  getOverview: async (mentorshipId: string): Promise<WorkspaceOverview> => {
    const { data } = await api.get(`api/workspace/${mentorshipId}/overview`);
    return data;
  },
  getSummaries: async (): Promise<WorkspaceSummary[]> => {
    const { data } = await api.get(`api/workspace/summaries`);
    return data;
  },
  getMessages: async (mentorshipId: string): Promise<WorkspaceMessage[]> => {
  const { data } = await api.get(`api/workspace/${mentorshipId}/messages`);
  return data;
},

getObjectives: (mentorshipId: string) =>
  api.get<Objective[]>(`api/workspace/${mentorshipId}/objectives`).then((r) => r.data),

createObjective: (
  mentorshipId: string,
  data: { title: string; category: string; progress: number },
) => api.post<Objective>(`api/workspace/${mentorshipId}/objectives`, data).then((r) => r.data),

updateObjective: (
  mentorshipId: string,
  objectiveId: string,
  data: Partial<{ title: string; category: string; progress: number }>,
) =>
  api
    .patch<Objective>(`api/workspace/${mentorshipId}/objectives/${objectiveId}`, data)
    .then((r) => r.data),

deleteObjective: (mentorshipId: string, objectiveId: string) =>
  api.delete(`api/workspace/${mentorshipId}/objectives/${objectiveId}`),

getDocuments: (mentorshipId: string) =>
  api.get<WorkspaceDocument[]>(`api/workspace/${mentorshipId}/documents`).then((r) => r.data),

uploadDocument: (mentorshipId: string, file: File, sessionNumber?: number) => {
  const formData = new FormData();
  formData.append("file", file);
  if (sessionNumber !== undefined) formData.append("sessionNumber", String(sessionNumber));

  return api
    .post<WorkspaceDocument>(`api/workspace/${mentorshipId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
},

deleteDocument: (mentorshipId: string, documentId: string) =>
  api.delete(`api/workspace/${mentorshipId}/documents/${documentId}`),

};


