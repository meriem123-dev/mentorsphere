export type AITabId = "resume" | "mentors" | "analyse" | "discussion";

export interface AIKpi {
  label: string;
  value: string;
  delta: string;
  deltaTrend: "up" | "down";
  source: "computed";
}

export interface AIAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface AISessionsSummary {
  periodLabel: string;      
  sessionsCount: number;
  content: string;  
}

export interface AISummaryResult {
  healthScore: number;    
  healthScoreDelta: string;
  kpis: AIKpi[];          
  sessionsSummary: AISessionsSummary | null;
  synthesis: string;
  alerts: AIAlert[];
  generatedAt: string;
}

export interface MentorMatch {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  description: string;
  tags: string[];
  matchScore: number;
  availability: "available" | "busy";
  avatarUrl?: string;
}


export interface MentorMatchesResult {
  matches: MentorMatch[];
  generatedAt: string;
}
