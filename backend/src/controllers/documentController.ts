import { Request, Response } from "express";
import {
  listWorkspaceDocuments,
  uploadWorkspaceDocument,
  deleteWorkspaceDocument,
} from "../services/documentService";


export async function listDocumentsHandler(req: Request, res: Response) {
  try {
    const mentorshipId = req.params.id as string;
    const userId = req.user!.userId;

    const result = await listWorkspaceDocuments(mentorshipId, userId);

    if (result === null) return res.status(404).json({ message: "Workspace introuvable" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Accès non autorisé" });

    return res.status(200).json(result);
  } catch (err) {
    console.error("DOCUMENT LIST ERROR:", err);
    return res
      .status(500)
      .json({ message: ("Erreur lors du chargement des documents") });
  }
}

export async function uploadDocumentHandler(req: Request, res: Response) {
  try {
    const mentorshipId = req.params.id as string;
    const userId = req.user!.userId;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Aucun fichier fourni" });

    const sessionNumber = req.body.sessionNumber
      ? Number(req.body.sessionNumber)
      : undefined;

    const result = await uploadWorkspaceDocument(mentorshipId, userId, file, sessionNumber);

    if (result === null) return res.status(404).json({ message: "Workspace introuvable" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Accès non autorisé" });

    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: ( "Erreur lors de l'upload du document") });
  }
}

export async function deleteDocumentHandler(req: Request, res: Response) {
  try {
    const mentorshipId = req.params.id as string;
    const documentId = req.params.documentId as string;
    const userId = req.user!.userId;

    const result = await deleteWorkspaceDocument(mentorshipId, documentId, userId);

    if (result === null) return res.status(404).json({ message: "Document introuvable" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Accès non autorisé" });

    return res.status(204).send();
  } catch (err) {
    return res
      .status(500)
      .json({ message: ("Erreur lors de la suppression du document") });
  }
}