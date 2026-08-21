export type WorkspaceTab =
  | "chat"
  | "sessions"
  | "objectifs"
  | "documents"
  | "tasks"
  | "members";

export type WorkspaceSummary = {
  id: string;
  startupName: string;
  startupInitials: string;
  isActive: boolean;
};

export type WorkspaceDetail = {
  id: string;
  startupName: string;
  startupInitials: string;
  since: string;
  stage: string;
  domain: string;
  progress: number;
  nextSession?: {
    date: string;
    durationMinutes: number;
    meetingUrl?: string;
  };
};

export type WorkspaceMessage = {
  id: string;
  senderInitials: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type ObjectiveCategory =
  | "Vision & stratégie"
  | "Étude de marché"
  | "Validation du besoin"
  | "Développement produit"
  | "Expérience utilisateur"
  | "Modèle économique"
  | "Marketing & croissance"
  | "Ventes"
  | "Finance"
  | "Levée de fonds"
  | "Préparation investisseurs"
  | "Juridique"
  | "Opérations"
  | "Leadership"
  | "Équipe"
  | "Technologie"
  | "Réseau & partenariats"
  | "Développement personnel";

export type Objective = {
  id: string;
  title: string;
  category: ObjectiveCategory;
  progress: number; // 0-100
};

export type DocumentFileType = "pdf" | "excel" | "word" | "image" | "other";

export type WorkspaceDocument = {
  id: string;
  name: string;
  fileType: DocumentFileType;
  sizeLabel: string;
  uploadedAt: string;
  sessionNumber?: number; // lien optionnel vers une session
  downloadUrl: string;
};

export type MemberRole = "owner" | "mentor" | "collaborator";

export type WorkspaceMember = {
  id: string;
  userId: string;
  name: string;
  initials: string;
  role: MemberRole;
  title: string;
  email: string;
  avatarAccent: "rose" | "navy" | "blue" | "muted";
};

export type WorkspaceOverview = {
  header: {
    startupName: string;
    startupInitials: string;
    since: string;
    stage: string;
    domain: string;
    progress: number;
  };
  members: WorkspaceMember[];
};

export type SessionParticipant = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type SessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type SessionAISummary = {
  objectifsAtteints: string[];
  pointsCles: string[];
  prochainesActions: string[];
};

export type Session = {
  id: string;
  number: number;
  status: SessionStatus;
  scheduledAt: string;
  durationMinutes: number;
  agenda?: string;
  meetingUrl?: string;
  rawNotes?: string;
  aiSummary?: SessionAISummary | null;
  participants?: SessionParticipant[];
  createdById: string;
};

export type CreateSessionPayload = {
  scheduledAt: string; // ISO string
  durationMinutes: number;
  agenda?: string;
  participantIds: string[];
};

export type SessionRoomCredentials = {
  appId: string;
  room: string;
  token: string;
  sessionNumber: number;
};

export type RescheduleSessionPayload = Partial<{
  scheduledAt: string;
  durationMinutes: number;
  agenda: string;
}>;

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string; // ISO string
};

export type CreateTaskPayload = {
  title: string;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  status?: TaskStatus;
};
