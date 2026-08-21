import { api } from "@/lib/api"; 
import type { AISummaryResult,MentorMatchesResult} from "../../../types/aiTypes";

export async function fetchAISummary(mentorshipId: string): Promise<AISummaryResult> {
  const res = await api.get<AISummaryResult>(`api/ai/summary/${mentorshipId}`);
  return res.data;
}

export async function fetchMentorMatches(mentorshipId: string): Promise<MentorMatchesResult> {
  const res = await api.get<MentorMatchesResult>(`api/ai/mentor-matches/${mentorshipId}`);
  return res.data;
}