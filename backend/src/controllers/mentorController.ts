
import { Request, Response } from "express";
import * as mentorService from "../services/mentorService";


//recup mentors
export const getMentors = async (req: Request, res: Response) => {
  try {
    const { search, domain, page, pageSize } = req.query;

    const result = await mentorService.getMentors({
      search: search as string | undefined,
      domain: domain as string | undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });

    return res.json(result);
  } catch (error) {
    console.error("getMentors error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

//un mentor
export const getMentorById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return res.status(400).json({ message: "Identifiant de mentor manquant." });
    }

    const mentor = await mentorService.getMentorById(id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor introuvable." });
    }

    return res.json({ mentor });
  } catch (error) {
    console.error("getMentorById error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};