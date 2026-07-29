import { Request, Response } from "express";
import { getWorkspaceOverview } from "../services/workspaceService";
import { getWorkspaceSummaries } from "../services/workspaceService";


//recup infos et membres
export async function getWorkspaceOverviewHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const result = await getWorkspaceOverview(id, userId);

    if (result === null) {
      return res.status(404).json({ message: "Workspace introuvable" });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès non autorisé à ce workspace" });
    }

    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors du chargement du workspace";
    return res.status(500).json({ message });
  }
}


//recup workspaces du user
export async function getWorkspaceSummariesHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role as "MENTOR" | "ENTREPRENEUR";

    const summaries = await getWorkspaceSummaries(userId, role);
    return res.status(200).json(summaries);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors du chargement des workspaces";
    return res.status(500).json({ message });
  }
}