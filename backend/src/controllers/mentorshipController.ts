
import { Request, Response } from "express";
import * as mentorshipService from "../services/mentorshipService";
import { $Enums } from "@prisma/client";

export const createMentorshipRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { mentorId, startupId, message } = req.body;

    if (!mentorId) {
      return res.status(400).json({ message: "Le mentor est requis." });
    }
    if (!startupId) {
      return res.status(400).json({ message: "La startup concernée est requise." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Un message est requis." });
    }

    const mentorship = await mentorshipService.createMentorshipRequest({
      userId,
      mentorId,
      startupId,
      message: message.trim(),
    });

    return res.status(201).json({ mentorship });
  } catch (error: any) {
    if (error.message === "STARTUP_NOT_OWNED") {
      return res.status(403).json({ message: "Cette startup ne vous appartient pas." });
    }
    if (error.message === "REQUEST_ALREADY_EXISTS") {
      return res.status(409).json({ message: "Une demande est déjà en cours pour cette startup et ce mentor." });
    }
    console.error("createMentorshipRequest error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getReceivedRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const requests = await mentorshipService.getReceivedRequests(
      userId,
      status as string | undefined,
    );

    return res.json({ requests });
  } catch (error) {
    console.error("getReceivedRequests error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getSentRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const requests = await mentorshipService.getSentRequests(userId);
    return res.json({ requests });
  } catch (error) {
    console.error("getSentRequests error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const respondToRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { accept } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Identifiant de demande requis." });
    }

    if (typeof accept !== "boolean") {
      return res.status(400).json({ message: "Le champ 'accept' (booléen) est requis." });
    }

    const mentorship = await mentorshipService.respondToRequest(id, userId, accept);

    if (!mentorship) {
      return res.status(404).json({ message: "Demande introuvable." });
    }

    return res.json({ mentorship });
  } catch (error) {
    console.error("respondToRequest error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

//recup mentorés
export const getMentees = async (req: Request, res: Response) => {
  try {
    const mentees = await mentorshipService.getMentees(req.user!.userId);
    return res.json({ mentees });
  } catch (error) {
    if (error instanceof Error && error.message === "MENTOR_NOT_FOUND") {
      return res.status(403).json({ message: "Profil mentor requis." });
    }
    console.error("getMentees error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};