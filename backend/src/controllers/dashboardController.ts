import { Request, Response } from "express";
import { getEntrepreneurDashboardStats,  getEntrepreneurParcours,
  getEntrepreneurStartupsList,
  getEntrepreneurWeeklyActivity,  getEntrepreneurMentorshipsList,
  getMentorshipSuggestionsState,
  generateMentorshipSuggestions, } from "../services/dashboardService";
  import {
  getMentorMatchesState,
  generateMentorMatches,
} from "../services/mentorMatchService"; 
import { assertMentorshipOwnership } from "../services/dashboardService";


export async function getDashboardStats(req: Request, res: Response) {
  try {
    const userId = req.user!.userId; 
    const stats = await getEntrepreneurDashboardStats(userId);
    return res.status(200).json(stats);
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({
      message: "Impossible de récupérer les statistiques du tableau de bord",
    });
  }
}


export async function getParcours(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const startupId = typeof req.query.startupId === "string" ? req.query.startupId : undefined;
    const parcours = await getEntrepreneurParcours(userId, startupId);
    return res.status(200).json(parcours);
  } catch (error) {
    console.error("getParcours error:", error);
    return res.status(500).json({ message: "Impossible de récupérer le parcours" });
  }
}

export async function getStartupsList(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const startups = await getEntrepreneurStartupsList(userId);
    return res.status(200).json(startups);
  } catch (error) {
    console.error("getStartupsList error:", error);
    return res.status(500).json({ message: "Impossible de récupérer la liste des projets" });
  }
}

export async function getWeeklyActivity(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const activity = await getEntrepreneurWeeklyActivity(userId);
    return res.status(200).json(activity);
  } catch (error) {
    console.error("getWeeklyActivity error:", error);
    return res.status(500).json({ message: "Impossible de récupérer l'activité hebdomadaire" });
  }
}



export async function getMentorshipsList(req: Request, res: Response) {
  try {
    const mentorships = await getEntrepreneurMentorshipsList(req.user!.userId);
    return res.status(200).json(mentorships);
  } catch (error) {
    console.error("getMentorshipsList error:", error);
    return res.status(500).json({ message: "Impossible de récupérer les mentorats" });
  }
}

export async function getSuggestionsState(req: Request, res: Response) {
  try {
    const mentorshipId = req.query.mentorshipId as string | undefined;
    if (!mentorshipId) {
      return res.status(400).json({ message: "mentorshipId requis" });
    }
    const state = await getMentorshipSuggestionsState(req.user!.userId, mentorshipId);
    return res.status(200).json(state);
  } catch (error) {
    console.error("getSuggestionsState error:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des suggestions" });
  }
}

export async function postSuggestions(req: Request, res: Response) {
  try {
    const { mentorshipId } = req.body as { mentorshipId?: string };
    if (!mentorshipId) {
      return res.status(400).json({ message: "mentorshipId requis" });
    }
    const outcome = await generateMentorshipSuggestions(req.user!.userId, mentorshipId);
    return res.status(200).json(outcome);
  } catch (error) {
    console.error("postSuggestions error:", error);
    return res.status(500).json({ message: "Erreur lors de la génération des suggestions" });
  }
}

export async function getMentorMatchesStateController(req: Request, res: Response) {
  try {
    const mentorshipId = req.query.mentorshipId as string | undefined;
    if (!mentorshipId) {
      return res.status(400).json({ message: "mentorshipId requis" });
    }
    await assertMentorshipOwnership(req.user!.userId, mentorshipId);
    const state = await getMentorMatchesState(mentorshipId);
    return res.status(200).json(state);
  } catch (error) {
    console.error("getMentorMatchesStateController error:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des recommandations" });
  }
}

export async function postMentorMatches(req: Request, res: Response) {
  try {
    const { mentorshipId } = req.body as { mentorshipId?: string };
    if (!mentorshipId) {
      return res.status(400).json({ message: "mentorshipId requis" });
    }
    await assertMentorshipOwnership(req.user!.userId, mentorshipId);
    const outcome = await generateMentorMatches(mentorshipId);
    return res.status(200).json(outcome);
  } catch (error) {
    console.error("postMentorMatches error:", error);
    return res.status(500).json({ message: "Erreur lors de la génération des recommandations" });
  }
}