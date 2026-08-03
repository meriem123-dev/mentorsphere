import { api } from "@/lib/api";

import type {
  WorkspaceOverview,
  WorkspaceSummary,
  WorkspaceMessage
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
};
