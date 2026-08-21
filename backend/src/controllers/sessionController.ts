import { Request, Response } from "express";
import {
  createSession,
  listSessions,
  getSessionById,
  updateSessionNotes,
  updateSessionStatus,
  getSessionRoomCredentials,
  cancelSession,
  rescheduleSession,
  deleteSession,
  getAndMarkDueReminders,
  generateSessionAISummary
} from "../services/sessionService";

//créer session
export async function createSessionHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const mentorshipIdParam = req.params.mentorshipId;
    const mentorshipId = Array.isArray(mentorshipIdParam)
      ? mentorshipIdParam[0]
      : mentorshipIdParam;

    if (!mentorshipId) {
      return res
        .status(400)
        .json({ message: "Identifiant de workspace manquant." });
    }

    const { scheduledAt, durationMinutes, agenda, participantIds } = req.body;

    // validation manuelle inline (pas de Zod)
    if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
      return res.status(400).json({ message: "Date de session invalide." });
    }

    const parsedDuration = Number(durationMinutes);
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({ message: "Durée invalide." });
    }

    if (
      !Array.isArray(participantIds) ||
      participantIds.some((id) => typeof id !== "string")
    ) {
      return res
        .status(400)
        .json({ message: "Liste de participants invalide." });
    }

    if (agenda !== undefined && typeof agenda !== "string") {
      return res.status(400).json({ message: "Agenda invalide." });
    }

    const { meetingUrl } = req.body;
    if (meetingUrl !== undefined && typeof meetingUrl !== "string") {
      return res.status(400).json({ message: "Lien de réunion invalide." });
    }

    const result = await createSession(mentorshipId, userId, {
      scheduledAt: new Date(scheduledAt),
      durationMinutes: parsedDuration,
      agenda: agenda ?? undefined,
      participantIds,
    });

    if (!result) {
      return res.status(404).json({ message: "Workspace introuvable." });
    }

    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }

    if (result === "NOT_ALLOWED_TO_CREATE") {
      return res.status(403).json({
        message: "Seuls le mentor et le fondateur peuvent créer une session.",
      });
    }

    if ("error" in result && result.error === "INVALID_PARTICIPANTS") {
      return res.status(400).json({
        message: "Certains participants ne font pas partie de ce workspace.",
        invalidIds: result.invalidIds,
      });
    }

    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors de la création de la session." });
  }
}

//recup sessions
export async function listSessionsHandler(req: Request, res: Response) {
  try {
    const mentorshipId = req.params.mentorshipId as string;
    const userId = req.user!.userId;

    const result = await listSessions(mentorshipId, userId);

    if (result === null)
      return res.status(404).json({ message: "Workspace introuvable" });
    if (result === "FORBIDDEN")
      return res.status(403).json({ message: "Accès non autorisé" });

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors du chargement des sessions" });
  }
}

//changer le statut d'une session
export async function updateSessionStatusHandler(req: Request, res: Response) {
  try {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      return res
        .status(400)
        .json({ message: "Identifiant de session manquant." });
    }

    const { status } = req.body;
    const validStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED"];
    if (typeof status !== "string" || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    const userId = req.user!.userId;
    const result = await updateSessionStatus(
      sessionId,
      userId,
      status as "SCHEDULED" | "COMPLETED" | "CANCELLED",
    );

    if (result === null) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }
    if (result === "NOT_ALLOWED_TO_CREATE") {
      return res
        .status(403)
        .json({
          message: "Seul le mentor peut changer le statut de la session.",
        });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du statut." });
  }
}

//mettre à jour les notes partagées
export async function updateSessionNotesHandler(req: Request, res: Response) {
  try {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      return res
        .status(400)
        .json({ message: "Identifiant de session manquant." });
    }

    const { rawNotes } = req.body;
    if (typeof rawNotes !== "string") {
      return res.status(400).json({ message: "Notes invalides." });
    }

    const userId = req.user!.userId;
    const result = await updateSessionNotes(sessionId, userId, rawNotes);

    if (result === null) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors de la sauvegarde des notes." });
  }
}

//récupérer une session (room + détail)
export async function getSessionByIdHandler(req: Request, res: Response) {
  try {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      return res
        .status(400)
        .json({ message: "Identifiant de session manquant." });
    }

    const userId = req.user!.userId;
    const result = await getSessionById(sessionId, userId);

    if (result === null) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors du chargement de la session." });
  }
}

//récupérer les credentials JaaS (appId + token) pour rejoindre la room
export async function getSessionRoomCredentialsHandler(
  req: Request,
  res: Response,
) {
  try {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      return res
        .status(400)
        .json({ message: "Identifiant de session manquant." });
    }

    const userId = req.user!.userId;
    const result = await getSessionRoomCredentials(sessionId, userId);

    if (result === null) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }

    if (result === "NO_ROOM") {
      return res
        .status(404)
        .json({ message: "Aucune room configurée pour cette session." });
    }

    return res.status(200).json(result);
  } catch (err) {
  console.error("getSessionRoomCredentials error:", err); // <-- ajoute ça
  return res
    .status(500)
    .json({ message: "Erreur lors de la génération des accès à la session." });
}
}

//reprogrammer une session
export async function rescheduleSessionHandler(req: Request, res: Response) {
  try {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      return res
        .status(400)
        .json({ message: "Identifiant de session manquant." });
    }

    const { scheduledAt, durationMinutes, agenda } = req.body;

    if (scheduledAt !== undefined && isNaN(Date.parse(scheduledAt))) {
      return res.status(400).json({ message: "Date de session invalide." });
    }

    let parsedDuration: number | undefined;
    if (durationMinutes !== undefined) {
      parsedDuration = Number(durationMinutes);
      if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
        return res.status(400).json({ message: "Durée invalide." });
      }
    }

    if (agenda !== undefined && typeof agenda !== "string") {
      return res.status(400).json({ message: "Agenda invalide." });
    }

    const userId = req.user!.userId;
    const result = await rescheduleSession(sessionId, userId, {
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      durationMinutes: parsedDuration,
      agenda,
    });

    if (result === null) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }
    if (result === "NOT_ALLOWED_TO_RESCHEDULE") {
      return res.status(403).json({
        message:
          "Seuls le mentor et le fondateur peuvent reprogrammer cette session.",
      });
    }
    if (result === "SESSION_NOT_EDITABLE") {
      return res.status(409).json({
        message: "Cette session ne peut plus être reprogrammée.",
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors de la reprogrammation de la session." });
  }
}

//annuler une session
export async function cancelSessionHandler(req: Request, res: Response) {
  try {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      return res
        .status(400)
        .json({ message: "Identifiant de session manquant." });
    }

    const userId = req.user!.userId;
    const result = await cancelSession(sessionId, userId);

    if (result === null) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }
    if (result === "NOT_ALLOWED_TO_CANCEL") {
      return res.status(403).json({
        message: "Seuls le mentor et le fondateur peuvent annuler cette session.",
      });
    }
    if (result === "SESSION_ALREADY_COMPLETED") {
      return res
        .status(409)
        .json({ message: "Cette session est déjà terminée." });
    }
    if (result === "SESSION_ALREADY_CANCELLED") {
      return res
        .status(409)
        .json({ message: "Cette session est déjà annulée." });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors de l'annulation de la session." });
  }
}

//supprimer une session
export async function deleteSessionHandler(req: Request, res: Response) {
  try {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      return res
        .status(400)
        .json({ message: "Identifiant de session manquant." });
    }

    const userId = req.user!.userId;
    const result = await deleteSession(sessionId, userId);

    if (result === null) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }
    if (result === "NOT_ALLOWED_TO_DELETE") {
      return res.status(403).json({
        message: "Seuls le créateur et le mentor peuvent supprimer cette session.",
      });
    }
    if (result === "SESSION_COMPLETED_LOCKED") {
      return res.status(409).json({
        message: "Une session terminée ne peut pas être supprimée.",
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la session." });
  }
}

//recup rappels sessions 
export async function getDueRemindersHandler(req: Request, res: Response) {
  try {
    const secret = req.headers["x-internal-secret"];
    if (secret !== process.env.N8N_INTERNAL_SECRET) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const dueReminders = await getAndMarkDueReminders();
    return res.status(200).json({ sessions: dueReminders });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erreur lors de la récupération des rappels." });
  }
}

//générer le résumé IA à partir des notes
export async function generateSessionAISummaryHandler(req: Request, res: Response) {
  try {
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam) ? sessionIdParam[0] : sessionIdParam;

    if (!sessionId) {
      return res.status(400).json({ message: "Identifiant de session manquant." });
    }

    const userId = req.user!.userId;
    const result = await generateSessionAISummary(sessionId, userId);

    if (result === null) {
      return res.status(404).json({ message: "Session introuvable." });
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès refusé à ce workspace." });
    }
    if (result === "SESSION_NOT_COMPLETED") {
      return res.status(409).json({
        message: "Le résumé IA n'est disponible que pour une session terminée.",
      });
    }
    if (result === "NO_NOTES") {
      return res.status(409).json({
        message: "Aucune note n'a été prise pour cette session.",
      });
    }
    if (result === "AI_GENERATION_FAILED") {
      return res.status(502).json({
        message: "Erreur lors de la génération du résumé IA. Réessayez.",
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("generateSessionAISummary error:", err);
    return res.status(500).json({ message: "Erreur lors de la génération du résumé IA." });
  }
}
