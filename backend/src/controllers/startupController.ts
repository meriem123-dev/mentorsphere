import { Request, Response, NextFunction } from "express";
import { StartupService } from "../services/startupService";
import { ProjectStage } from "@prisma/client";

const STAGE_MAP: Record<string, ProjectStage> = {
  Idée: ProjectStage.IDEE,
  MVP: ProjectStage.MVP,
  Seed: ProjectStage.SEED,
  Croissance: ProjectStage.CROISSANCE,
};

const MAX_NEEDS = 6;

const MAX_STEPS = 12;

function parseRoadmapSteps(
  value: unknown,
): { title: string; completed: boolean }[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (s): s is { title: unknown; completed: unknown } =>
        typeof s === "object" && s !== null,
    )
    .map((s) => ({
      title: typeof s.title === "string" ? s.title.trim() : "",
      completed: Boolean(s.completed),
    }))
    .filter((s) => s.title.length > 0)
    .slice(0, MAX_STEPS);
}

//résout et valide un stage, retourne null si invalide
function resolveStage(value: unknown): ProjectStage | null {
  if (typeof value !== "string") return null;
  return STAGE_MAP[value] ?? null;
}

export class StartupController {
  static async createStartup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const {
        name,
        description,
        stage,
        domain,
        isPublic,
        isRecruiting,
        needs,
      } = req.body;

      const errors: Record<string, string> = {};

      if (!name || name.trim().length < 3 || name.trim().length > 60) {
        errors.name = "Le nom doit contenir entre 3 et 60 caractères";
      }
      if (
        !description ||
        description.trim().length < 20 ||
        description.trim().length > 500
      ) {
        errors.description =
          "La description doit contenir entre 20 et 500 caractères";
      }

      const resolvedStage = resolveStage(stage);
      if (!resolvedStage) {
        errors.stage = "Étape invalide";
      }

      if (!domain || typeof domain !== "string") {
        errors.domain = "Domaine requis";
      }

      const parsedNeeds = Array.isArray(needs) ? needs : [];
      if (parsedNeeds.length > MAX_NEEDS) {
        errors.needs = `${MAX_NEEDS} besoins maximum`;
      }

      const parsedSteps = parseRoadmapSteps(req.body.roadmapSteps);

      if (
        Object.keys(errors).length > 0 ||
        !resolvedStage ||
        typeof domain !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors,
        });
      }

      const startup = await StartupService.createStartup({
        userId,
        name: name.trim(),
        description: description.trim(),
        stage: resolvedStage,
        domain,
        isPublic: Boolean(isPublic),
        isRecruiting: Boolean(isRecruiting),
        needs: parsedNeeds,
        roadmapSteps: parsedSteps,
      });

      res.status(201).json({
        success: true,
        message: "Startup créée avec succès",
        data: { startup },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "ENTREPRENEUR_NOT_FOUND"
      ) {
        return res.status(403).json({
          success: false,
          message: "Profil entrepreneur requis",
        });
      }
      next(error);
    }
  }
  static async getMyStartups(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const startups = await StartupService.getMyStartups(userId);

      res.status(200).json({
        success: true,
        data: { startups },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "ENTREPRENEUR_NOT_FOUND"
      ) {
        return res.status(403).json({
          success: false,
          message: "Profil entrepreneur requis",
        });
      }
      next(error);
    }
  }

  static async updateStartup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id;
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Identifiant de startup invalide",
        });
      }

      const {
        name,
        description,
        stage,
        domain,
        isPublic,
        isRecruiting,
        needs,
      } = req.body;

      const errors: Record<string, string> = {};

      if (
        name !== undefined &&
        (name.trim().length < 3 || name.trim().length > 60)
      ) {
        errors.name = "Le nom doit contenir entre 3 et 60 caractères";
      }
      if (
        description !== undefined &&
        (description.trim().length < 20 || description.trim().length > 500)
      ) {
        errors.description =
          "La description doit contenir entre 20 et 500 caractères";
      }

      let resolvedStage: ProjectStage | undefined;
      if (stage !== undefined) {
        const parsed = resolveStage(stage);
        if (!parsed) {
          errors.stage = "Étape invalide";
        } else {
          resolvedStage = parsed;
        }
      }

      if (
        needs !== undefined &&
        Array.isArray(needs) &&
        needs.length > MAX_NEEDS
      ) {
        errors.needs = `${MAX_NEEDS} besoins maximum`;
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors,
        });
      }

      const startup = await StartupService.updateStartup({
        userId,
        startupId: id,
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(resolvedStage !== undefined && { stage: resolvedStage }),
        ...(domain !== undefined && typeof domain === "string" && { domain }),
        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
        ...(isRecruiting !== undefined && {
          isRecruiting: Boolean(isRecruiting),
        }),
        ...(needs !== undefined && Array.isArray(needs) && { needs }),
        ...(req.body.roadmapSteps !== undefined && {
          roadmapSteps: parseRoadmapSteps(req.body.roadmapSteps),
        }),
      });

      res.status(200).json({
        success: true,
        message: "Startup mise à jour avec succès",
        data: { startup },
      });
    } catch (error) {
      if (error instanceof Error && error.message === "STARTUP_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Startup introuvable",
        });
      }
      if (error instanceof Error && error.message === "FORBIDDEN") {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à modifier cette startup",
        });
      }
      next(error);
    }
  }

  static async deleteStartup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id;
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Identifiant de startup invalide",
        });
      }

      await StartupService.deleteStartup(userId, id);

      res.status(200).json({
        success: true,
        message: "Startup supprimée avec succès",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "STARTUP_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Startup introuvable",
        });
      }
      if (error instanceof Error && error.message === "FORBIDDEN") {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à supprimer cette startup",
        });
      }
      next(error);
    }
  }
}
