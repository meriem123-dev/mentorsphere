import type { Request, Response } from "express";
import { getAISummaryState, generateAISummary } from "../services/aiService";
import { getWorkspaceAccess } from "../services/workspaceService";
import {  getMentorMatchesState, generateMentorMatches } from "../services/mentorMatchService";
import { getSwotAnalysisState, generateSwotAnalysis } from "../services/aiSwotService";
import { getAIChatState, sendAIChatMessage } from "../services/aiChatService";


//  Résumé IA 

// tab summary — check cache/état, ne consomme aucune tentative
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

    const state = await getAISummaryState(mentorshipId);
    return res.json(state);
  } catch (error) {
    console.error("getAISummary error:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération du résumé IA." });
  }
}

// bouton Générer/Régénérer — consomme une tentative si disponible
export async function generateAISummaryHandler(req: Request, res: Response) {
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

    const outcome = await generateAISummary(mentorshipId);
    return res.json(outcome);
  } catch (error) {
    console.error("generateAISummaryHandler error:", error);
    return res.status(500).json({ message: "Erreur lors de la génération du résumé IA." });
  }
}

//  Recommandations mentors 

// tab matching — check cache/état, ne consomme aucune tentative
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

    const state = await getMentorMatchesState(mentorshipId);
    return res.json(state);
  } catch (error) {
    console.error("getMentorMatches error:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des recommandations." });
  }
}

// bouton Générer/Régénérer — consomme une tentative si disponible
export async function generateMentorMatchesHandler(req: Request, res: Response) {
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

    const outcome = await generateMentorMatches(mentorshipId);
    return res.json(outcome);
  } catch (error) {
    console.error("generateMentorMatchesHandler error:", error);
    return res.status(500).json({ message: "Erreur lors de la génération des recommandations." });
  }
}


// tab analyse — check cache/état, ne consomme aucune tentative
export async function getSwotAnalysis(req: Request, res: Response) {
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

    const state = await getSwotAnalysisState(mentorshipId);
    return res.json(state);
  } catch (error) {
    console.error("getSwotAnalysis error:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération de l'analyse SWOT." });
  }
}

// bouton Générer/Régénérer — consomme une tentative si disponible
export async function generateSwotAnalysisHandler(req: Request, res: Response) {
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

    const outcome = await generateSwotAnalysis(mentorshipId);
    return res.json(outcome);
  } catch (error) {
    console.error("generateSwotAnalysisHandler error:", error);
    return res.status(500).json({ message: "Erreur lors de la génération de l'analyse SWOT." });
  }
}


export async function getAIChat(req: Request, res: Response) {
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

    const state = await getAIChatState(mentorshipId);
    return res.json(state);
  } catch (error) {
    console.error("getAIChat error:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération de la conversation." });
  }
}

export async function sendAIChatMessageHandler(req: Request, res: Response) {
  try {
    const { mentorshipId } = req.params;
    if (!mentorshipId || Array.isArray(mentorshipId)) {
      return res.status(400).json({ message: "Identifiant de mentorat invalide." });
    }

    const { message } = req.body as { message?: string };
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Le message ne peut pas être vide." });
    }

    const userId = req.user!.userId;
    const access = await getWorkspaceAccess(mentorshipId, userId);
    if (!access || access === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès non autorisé à ce workspace." });
    }

    const outcome = await sendAIChatMessage(mentorshipId, message.trim());
    return res.json(outcome);
  } catch (error) {
    console.error("sendAIChatMessageHandler error:", error);
    return res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
}