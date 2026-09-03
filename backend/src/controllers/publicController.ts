import { Request, Response } from "express";
import { getPlatformStats, getTestimonials } from "../services/publicService";

export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await getPlatformStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error("getStats error:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
  }
};

export const getTestimonialsList = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 3;
    const testimonials = await getTestimonials(limit);
    return res.status(200).json({ testimonials });
  } catch (error) {
    console.error("getTestimonialsList error:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des témoignages" });
  }
};