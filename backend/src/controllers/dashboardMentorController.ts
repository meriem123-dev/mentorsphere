import type { Request, Response } from "express";
import {
  getMentorDashboardStats,
  getMentorMenteeProgress,
  getMentorRecentFeedbacks,
  getMentorSessionsActivity,
  getMentorUpcomingSessions,
} from "../services/dashboradMentorService";

export async function getMentorDashboardStatsHandler(req: Request, res: Response) {
  try {
    const stats = await getMentorDashboardStats(req.user!.userId);
    res.json(stats);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : "Erreur inconnue" });
  }
}

export async function getMentorMenteeProgressHandler(req: Request, res: Response) {
  try {
    const mentees = await getMentorMenteeProgress(req.user!.userId);
    res.json(mentees);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : "Erreur inconnue" });
  }
}

export async function getMentorSessionsActivityHandler(req: Request, res: Response) {
  try {
    const activity = await getMentorSessionsActivity(req.user!.userId);
    res.json(activity);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : "Erreur inconnue" });
  }
}

export async function getMentorUpcomingSessionsHandler(req: Request, res: Response) {
  try {
    const sessions = await getMentorUpcomingSessions(req.user!.userId);
    res.json(sessions);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : "Erreur inconnue" });
  }
}

export const getRecentFeedbacks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const feedbacks = await getMentorRecentFeedbacks(
      userId,
      limit,
    );
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les feedbacks" });
  }
};