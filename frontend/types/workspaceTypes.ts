export type WorkspaceTab =
  | "chat"
  | "sessions"
  | "objectifs"
  | "documents"
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

export type SessionStatus = "upcoming" | "completed" | "cancelled";

export type Session = {
  id: string;
  number: number;
  status: SessionStatus;
  date: string; // ISO string
  durationMinutes: number;
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
  sizeLabel: string; // ex: "2.4 MB"
  uploadedAt: string; // ISO string
  sessionNumber?: number; // lien optionnel vers une session
  downloadUrl: string;
};

export type MemberRole = "owner" | "mentor" | "editor" | "viewer";

export type WorkspaceMember = {
  id: string;
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
