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

export interface AIGenerationState<T> {
  result: T | null;
  attemptsRemaining: number;
  windowResetAt: string | null;
}

export interface AIGenerationOutcome<T> extends AIGenerationState<T> {
  result: T; 
  limitReached: boolean;
}

export interface SwotAnalysisResult {
  forces: string[];
  faiblesses: string[];
  opportunites: string[];
  menaces: string[];
  insight: string;
  generatedAt: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AIChatState {
  messages: AIChatMessage[];
  attemptsRemaining: number;
  windowResetAt: string | null;
}

export interface AIChatOutcome extends AIChatState {
  limitReached: boolean;
}

export type KeyEvolutionTrend = "positive" | "negative" | "neutral";

export interface KeyEvolution {
  id: string;
  label: string;
  value: string;
  trend: KeyEvolutionTrend;
}

export interface AgendaSuggestionItem {
  id: string;
  title: string;
  durationMinutes: number;
}

export interface MentorBriefingResult {
  summary: string;
  periodLabel: string;
  keyEvolutions: KeyEvolution[];
  suggestedAgenda: AgendaSuggestionItem[];
  generatedAt: string;
}