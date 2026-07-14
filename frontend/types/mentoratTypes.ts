export type MentorshipStage = "Idée" | "MVP" | "Seed" | "Croissance";

export interface MentorshipRequest {
  id: string;
  entrepreneurName: string;
  entrepreneurInitials: string;
  /** Contrôle la couleur de l'avatar */
  accentAvatar?: "blue" | "rose";
  projectName: string;
  /** Un des 14 domaines d'expertise définis dans expertise.ts */
  domain: string;
  stage: MentorshipStage;
  message: string;
  timeAgo: string;
  /** Score d'affinité 0-100 */
  compatibilityScore?: number;
}