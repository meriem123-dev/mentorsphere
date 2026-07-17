export type ProjectStage = "Idée" | "MVP" | "Seed" | "Croissance";

export interface StartupStep {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface StartupPayload {
  name: string;
  description: string;
  stage: ProjectStage;
  domain: string;
  isPublic: boolean;
  isRecruiting: boolean;
  needs: string[];
  roadmapSteps: { title: string; completed: boolean }[];
}

export interface UpdateStartupPayload {
  name?: string;
  description?: string;
  stage?: ProjectStage;
  domain?: string;
  isPublic?: boolean;
  isRecruiting?: boolean;
  needs?: string[];
  roadmapSteps?: { title: string; completed: boolean }[];
}

export interface Startup {
  id: string;
  name: string;
  description: string;
  stage: "IDEE" | "MVP" | "SEED" | "CROISSANCE";
  domain: string;
  isPublic: boolean;
  isRecruiting: boolean;
  needs: string[];
  entrepreneurId: string;
  createdAt: string;
  updatedAt: string;
  steps: StartupStep[];
  joinRequestStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null;
}

export interface StartupResponse {
  success: boolean;
  message: string;
  data: { startup: Startup };
}

export interface StartupsListResponse {
  success: boolean;
  data: { startups: Startup[] };
}

export interface DeleteStartupResponse {
  success: boolean;
  message: string;
}

export interface GetStartupResponse {
  success: boolean;
  data: { startup: Startup; isOwner: boolean };
}
