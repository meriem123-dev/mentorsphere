import { api } from "@/lib/api";

import type {
  WorkspaceOverview,
  WorkspaceSummary,
  WorkspaceMessage,
  Objective,
  WorkspaceDocument,
  Session,
  CreateSessionPayload,
  SessionStatus,
  SessionRoomCredentials,
  RescheduleSessionPayload,
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "@/types/workspaceTypes";

export const workspaceApi = {
  //général
  getOverview: async (mentorshipId: string): Promise<WorkspaceOverview> => {
    const { data } = await api.get(`api/workspace/${mentorshipId}/overview`);
    return data;
  },
  getSummaries: async (): Promise<WorkspaceSummary[]> => {
    const { data } = await api.get(`api/workspace/summaries`);
    return data;
  },

  //chat
  getMessages: async (mentorshipId: string): Promise<WorkspaceMessage[]> => {
    const { data } = await api.get(`api/workspace/${mentorshipId}/messages`);
    return data;
  },

  //objectifs
  getObjectives: (mentorshipId: string) =>
    api
      .get<Objective[]>(`api/workspace/${mentorshipId}/objectives`)
      .then((r) => r.data),

  createObjective: (
    mentorshipId: string,
    data: { title: string; category: string; progress: number },
  ) =>
    api
      .post<Objective>(`api/workspace/${mentorshipId}/objectives`, data)
      .then((r) => r.data),

  updateObjective: (
    mentorshipId: string,
    objectiveId: string,
    data: Partial<{ title: string; category: string; progress: number }>,
  ) =>
    api
      .patch<Objective>(
        `api/workspace/${mentorshipId}/objectives/${objectiveId}`,
        data,
      )
      .then((r) => r.data),

  deleteObjective: (mentorshipId: string, objectiveId: string) =>
    api.delete(`api/workspace/${mentorshipId}/objectives/${objectiveId}`),

  //docs
  getDocuments: (mentorshipId: string) =>
    api
      .get<WorkspaceDocument[]>(`api/workspace/${mentorshipId}/documents`)
      .then((r) => r.data),

  uploadDocument: (
    mentorshipId: string,
    file: File,
    sessionNumber?: number,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (sessionNumber !== undefined)
      formData.append("sessionNumber", String(sessionNumber));

    return api
      .post<WorkspaceDocument>(
        `api/workspace/${mentorshipId}/documents`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      .then((r) => r.data);
  },

  deleteDocument: (mentorshipId: string, documentId: string) =>
    api.delete(`api/workspace/${mentorshipId}/documents/${documentId}`),

  createSession: async (
    mentorshipId: string,
    payload: CreateSessionPayload,
  ) => {
    const { data } = await api.post<Session>(
      `api/workspace/${mentorshipId}/sessions`,
      payload,
    );
    return data;
  },

  getSessions: (mentorshipId: string) =>
    api
      .get<Session[]>(`api/workspace/${mentorshipId}/sessions`)
      .then((r) => r.data),
  getSessionById: (mentorshipId: string, sessionId: string) =>
    api
      .get<Session>(`api/workspace/${mentorshipId}/sessions/${sessionId}`)
      .then((r) => r.data),

  updateSessionStatus: (
    mentorshipId: string,
    sessionId: string,
    status: SessionStatus,
  ) =>
    api
      .patch<Session>(
        `api/workspace/${mentorshipId}/sessions/${sessionId}/status`,
        { status },
      )
      .then((r) => r.data),

  updateSessionNotes: (
    mentorshipId: string,
    sessionId: string,
    rawNotes: string,
  ) =>
    api
      .patch<Session>(
        `api/workspace/${mentorshipId}/sessions/${sessionId}/notes`,
        { rawNotes },
      )
      .then((r) => r.data),

  getSessionRoomCredentials: (mentorshipId: string, sessionId: string) =>
    api
      .get<SessionRoomCredentials>(
        `api/workspace/${mentorshipId}/sessions/${sessionId}/room`,
      )
      .then((r) => r.data),

  rescheduleSession: (
    mentorshipId: string,
    sessionId: string,
    payload: RescheduleSessionPayload,
  ) =>
    api
      .patch<Session>(
        `api/workspace/${mentorshipId}/sessions/${sessionId}/reschedule`,
        payload,
      )
      .then((r) => r.data),

  cancelSession: (mentorshipId: string, sessionId: string) =>
    api
      .patch<Session>(
        `api/workspace/${mentorshipId}/sessions/${sessionId}/cancel`,
      )
      .then((r) => r.data),

  deleteSession: (mentorshipId: string, sessionId: string) =>
    api.delete(`api/workspace/${mentorshipId}/sessions/${sessionId}`),

  generateSessionAISummary: (mentorshipId: string, sessionId: string) =>
    api
      .post<Session>(
        `api/workspace/${mentorshipId}/sessions/${sessionId}/ai-summary`,
      )
      .then((r) => r.data),

  getTasks: (mentorshipId: string) =>
    api.get<Task[]>(`api/workspace/${mentorshipId}/tasks`).then((r) => r.data),

  createTask: (mentorshipId: string, payload: CreateTaskPayload) =>
    api
      .post<Task>(`api/workspace/${mentorshipId}/tasks`, payload)
      .then((r) => r.data),

  updateTask: (
    mentorshipId: string,
    taskId: string,
    payload: UpdateTaskPayload,
  ) =>
    api
      .patch<Task>(`api/workspace/${mentorshipId}/tasks/${taskId}`, payload)
      .then((r) => r.data),

  deleteTask: (mentorshipId: string, taskId: string) =>
    api.delete(`api/workspace/${mentorshipId}/tasks/${taskId}`),
};
