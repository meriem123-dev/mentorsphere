import { api } from "@/lib/api";
import type {
  AIGenerationState,
  AIGenerationOutcome,
  AISummaryResult,
  MentorMatchesResult,
} from "../../../types/aiTypes";
import type { SwotAnalysisResult } from "../../../types/aiTypes";
import type { AIChatState, AIChatOutcome } from "../../../types/aiTypes";

// --- Résumé IA ---

export async function fetchAISummaryState(
  mentorshipId: string
): Promise<AIGenerationState<AISummaryResult>> {
  const res = await api.get<AIGenerationState<AISummaryResult>>(
    `api/ai/${mentorshipId}/ai-summary`
  );
  return res.data;
}

export async function generateAISummary(
  mentorshipId: string
): Promise<AIGenerationOutcome<AISummaryResult>> {
  const res = await api.post<AIGenerationOutcome<AISummaryResult>>(
    `api/ai/${mentorshipId}/ai-summary/generate`
  );
  return res.data;
}

// --- Recommandations mentors ---

export async function fetchMentorMatchesState(
  mentorshipId: string
): Promise<AIGenerationState<MentorMatchesResult>> {
  const res = await api.get<AIGenerationState<MentorMatchesResult>>(
    `api/ai/${mentorshipId}/mentor-matches`
  );
  return res.data;
}

export async function generateMentorMatches(
  mentorshipId: string
): Promise<AIGenerationOutcome<MentorMatchesResult>> {
  const res = await api.post<AIGenerationOutcome<MentorMatchesResult>>(
    `api/ai/${mentorshipId}/mentor-matches/generate`
  );
  return res.data;
}


export async function fetchSwotAnalysisState(
  mentorshipId: string
): Promise<AIGenerationState<SwotAnalysisResult>> {
  const res = await api.get<AIGenerationState<SwotAnalysisResult>>(
    `api/ai/${mentorshipId}/swot`
  );
  return res.data;
}

export async function generateSwotAnalysis(
  mentorshipId: string
): Promise<AIGenerationOutcome<SwotAnalysisResult>> {
  const res = await api.post<AIGenerationOutcome<SwotAnalysisResult>>(
    `api/ai/${mentorshipId}/swot/generate`
  );
  return res.data;
}


export async function fetchAIChatState(mentorshipId: string): Promise<AIChatState> {
  const res = await api.get<AIChatState>(`api/ai/${mentorshipId}/chat`);
  return res.data;
}

export async function sendAIChatMessage(
  mentorshipId: string,
  message: string
): Promise<AIChatOutcome> {
  const res = await api.post<AIChatOutcome>(`api/ai/${mentorshipId}/chat/send`, { message });
  return res.data;
}