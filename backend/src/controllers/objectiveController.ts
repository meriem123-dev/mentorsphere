import { Request, Response } from "express";
import {
  listObjectives,
  createObjective,
  updateObjective,
  deleteObjective,
} from "../services/objectiveService";

export async function listObjectivesHandler(req: Request, res: Response) {
  try {
    const mentorshipId = req.params.id as string;
    const userId = req.user!.userId;

    const result = await listObjectives(mentorshipId, userId);

    if (result === null) return res.status(404).json({ message: "Workspace introuvable" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Accès non autorisé" });

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: ("Erreur lors du chargement des objectifs") });
  }
}

export async function createObjectiveHandler(req: Request, res: Response) {
  try {
    const mentorshipId = req.params.id as string;
    const userId = req.user!.userId;
    const { title, category, progress } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: "Titre et catégorie requis" });
    }

    const result = await createObjective(mentorshipId, userId, { title, category, progress });

    if (result === null) return res.status(404).json({ message: "Workspace introuvable" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Accès non autorisé" });

    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors de la création de l'objectif" });
  }
}

export async function updateObjectiveHandler(req: Request, res: Response) {
  try {
    const mentorshipId = req.params.id as string;
    const objectiveId = req.params.objectiveId as string;
    const userId = req.user!.userId;
    const { title, category, progress } = req.body;

    const result = await updateObjective(mentorshipId, objectiveId, userId, {
      title,
      category,
      progress,
    });

    if (result === null) return res.status(404).json({ message: "Objectif introuvable" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Accès non autorisé" });

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: ("Erreur lors de la modification de l'objectif") });
  }
}

export async function deleteObjectiveHandler(req: Request, res: Response) {
  try {
    const mentorshipId = req.params.id as string;
    const objectiveId = req.params.objectiveId as string;
    const userId = req.user!.userId;

    const result = await deleteObjective(mentorshipId, objectiveId, userId);

    if (result === null) return res.status(404).json({ message: "Objectif introuvable" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Accès non autorisé" });

    return res.status(204).send();
  } catch (err) {
    return res
      .status(500)
      .json({ message: ("Erreur lors de la suppression de l'objectif") });
  }
}