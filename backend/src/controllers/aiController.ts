import type { Request, Response } from "express";
import { generateAISummary } from "../services/aiService";
import { getWorkspaceAccess } from "../services/workspaceService";
import { generateMentorMatches } from "../services/mentorMatchService";


// tab summary
export async function getAISummary(req: Request, res: Response) {
  try {
    const { mentorshipId } = req.params;

    if (!mentorshipId || Array.isArray(mentorshipId)) {
      return res.status(400).json({ message: "Identifiant de mentorat invalide." });
    }

    const userId = req.user!.userId;

    const access = await getWorkspaceAccess(mentorshipId, userId);
    if (!access || access === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès non autorisé à ce workspace." });
    }

    const result = await generateAISummary(mentorshipId);
    return res.json(result);
  } catch (error) {
    console.error("getAISummary error:", error);
    return res.status(500).json({ message: "Erreur lors de la génération du résumé IA." });
  }
}

// tab matching
export async function getMentorMatches(req: Request, res: Response) {
  try {
    const { mentorshipId } = req.params;
    if (!mentorshipId || Array.isArray(mentorshipId)) {
      return res.status(400).json({ message: "Identifiant de mentorat invalide." });
    }

    const userId = req.user!.userId;
    const access = await getWorkspaceAccess(mentorshipId, userId);
    if (!access || access === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès non autorisé à ce workspace." });
    }

    const result = await generateMentorMatches(mentorshipId);
    return res.json(result);
  } catch (error) {
    console.error("getMentorMatches error:", error);
    return res.status(500).json({ message: "Erreur lors de la génération des recommandations." });
  }
}