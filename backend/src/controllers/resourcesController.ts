import { Request, Response } from "express";
import { ResourceType } from "@prisma/client";
import * as resourcesService from "../services/resourcesService";


//création
export async function createResourceHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { type, title, url, durationLabel } = req.body;

    if (!type || !title) {
      return res.status(400).json({ message: "Le type et le titre sont requis." });
    }
    if (type === "VIDEO" && !url) {
      return res.status(400).json({ message: "Un lien est requis pour une ressource vidéo." });
    }
    if (type === "LINK" && !url) {
      return res.status(400).json({ message: "Un lien est requis pour cette ressource." });
    }
    if (type === "DOCUMENT" && !req.file) {
      return res.status(400).json({ message: "Un fichier est requis pour une ressource document." });
    }

    const resource = await resourcesService.createResource({
      type,
      title,
      authorId: userId,
      ...(url && { url }),
      ...(durationLabel && { durationLabel }),
      ...(req.file && {
        file: {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      }),
    });

    return res.status(201).json(resource);
  } catch (err) {
    console.error("createResourceHandler error:", err);
    return res.status(500).json({ message: "Erreur lors de la création de la ressource." });
  }
}

const VALID_TYPES = Object.values(ResourceType);

//recup
export async function listResourcesHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { type, search, savedOnly, page, limit } = req.query;

    if (type && !VALID_TYPES.includes(type as ResourceType)) {
      return res.status(400).json({ message: "Type de ressource invalide." });
    }

    const result = await resourcesService.listResources({
      userId,
      ...(type && { type: type as ResourceType }),
      ...(search && { search: String(search) }),
      ...(savedOnly === "true" && { savedOnly: true }),
      ...(page && { page: Number(page) }),
      ...(limit && { limit: Number(limit) }),
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("listResourcesHandler error:", err);
    return res.status(500).json({ message: "Erreur lors de la récupération des ressources." });
  }
}

//recup une ressource
export async function getResourceHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const resource = await resourcesService.getResourceById(id, userId);

    if (!resource) {
      return res.status(404).json({ message: "Ressource introuvable." });
    }
    return res.status(200).json(resource);
  } catch (err) {
    console.error("getResourceHandler error:", err);
    return res.status(500).json({ message: "Erreur lors de la récupération de la ressource." });
  }
}


//supp
export async function deleteResourceHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
     const  id  = req.params.id as string;
 
     const result = await resourcesService.deleteResource(id, userId);

    if (result === "NOT_FOUND") {
      return res.status(404).json({ message: "Ressource introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette ressource." });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("deleteResourceHandler error:", err);
    return res.status(500).json({ message: "Erreur lors de la suppression de la ressource." });
  }
}


//enregistrement
export async function toggleSaveResourceHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const result = await resourcesService.toggleSaveResource(id, userId);

    if (result === "NOT_FOUND") {
      return res.status(404).json({ message: "Ressource introuvable." });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error("toggleSaveResourceHandler error:", err);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement." });
  }
}