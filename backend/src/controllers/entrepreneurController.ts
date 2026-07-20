import { Request, Response } from "express";
import * as entrepreneurService from "../services/entrepreneurService";

//recup entrepreneurs
export const getEntrepreneurs = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { search, domain, page, pageSize } = req.query;

    const result = await entrepreneurService.getEntrepreneurs({
      userId,
      search: search as string | undefined,
      domain: domain as string | undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });

    return res.json(result);
  } catch (error) {
    console.error("getEntrepreneurs error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

//un entrepreneur
export const getEntrepreneurById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return res.status(400).json({ message: "Identifiant d'entrepreneur manquant." });
    }

    const entrepreneur = await entrepreneurService.getEntrepreneurById(
      id,
      req.user!.userId,
    );

    if (!entrepreneur) {
      return res.status(404).json({ message: "Entrepreneur introuvable." });
    }

    return res.json({ entrepreneur });
  } catch (error) {
    console.error("getEntrepreneurById error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};