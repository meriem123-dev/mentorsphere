import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profileService";

export class ProfileController {
  //compléter le profil entrepreneur (wizard)
  static async completeEntrepreneurProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.userId;
      const {
        bio,
        birthDate,
        country,
        city,
        languages,
        domains,
        skills,
        profession,
        level,
        lookingFor,
        availability,
        linkedin,
        github,
        portfolio,
      } = req.body;

      const errors: Record<string, string> = {};

      if (!bio || bio.trim().length < 10) {
        errors.bio = "Biographie requise (min 10 caractères)";
      }
      if (!country) {
        errors.country = "Pays requis";
      }
      if (!city) {
        errors.city = "Ville requise";
      }

      const parsedLanguages = safeParseArray(languages);
      const parsedDomains = safeParseArray(domains);
      const parsedSkills = safeParseArray(skills);
      const parsedLookingFor = safeParseArray(lookingFor);
      const parsedAvailability = safeParseArray(availability);

      if (parsedLanguages.length === 0) {
        errors.languages = "Au moins une langue requise";
      }
      if (parsedDomains.length === 0) {
        errors.domains = "Au moins un domaine d'intérêt requis";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors,
        });
      }

      const photo = (req.files as any)?.photo?.[0] ?? null;
      const cv = (req.files as any)?.cv?.[0] ?? null;
      const documents = (req.files as any)?.documents ?? [];

      const socialLinks = buildSocialLinks({ linkedin, github, portfolio });

      const updatedUser = await ProfileService.completeEntrepreneurProfile({
        userId,
        bio: bio.trim(),
        birthDate: birthDate ? new Date(birthDate) : null,
        country,
        city,
        languages: parsedLanguages,
        domains: parsedDomains,
        skills: parsedSkills,
        profession: profession || null,
        level: level || null,
        lookingFor: parsedLookingFor,
        availability: parsedAvailability,
        socialLinks,
        photoFile: photo,
        cvFile: cv,
        documentFiles: documents,
      });

      res.status(200).json({
        success: true,
        message: "Profil entrepreneur complété avec succès",
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }
  //compléter le profil mentor (wizard)
  static async completeMentorProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.userId;
      const {
        bio,
        birthDate,
        country,
        city,
        languages,
        domains,
        skills,
        profession,
        yearsOfExperience,
        availability,
        linkedin,
        github,
        portfolio,
        website,
      } = req.body;

      const errors: Record<string, string> = {};

      if (!bio || bio.trim().length < 10) {
        errors.bio = "Biographie requise (min 10 caractères)";
      }
      if (!country) {
        errors.country = "Pays requis";
      }
      if (!city) {
        errors.city = "Ville requise";
      }
      if (!profession || profession.trim().length < 2) {
        errors.profession = "Profession requise";
      }
      if (!yearsOfExperience) {
        errors.yearsOfExperience = "Années d'expérience requises";
      }

      const parsedLanguages = safeParseArray(languages);
      const parsedDomains = safeParseArray(domains);
      const parsedSkills = safeParseArray(skills);
      const parsedAvailability = safeParseArray(availability);

      if (parsedDomains.length === 0) {
        errors.domains = "Au moins un domaine d'expertise requis";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors,
        });
      }

      const photo = (req.files as any)?.photo?.[0] ?? null;
      const cv = (req.files as any)?.cv?.[0] ?? null;
      const documents = (req.files as any)?.documents ?? [];

      const socialLinks = buildSocialLinks({
        linkedin,
        github,
        portfolio,
        website,
      });

      const updatedUser = await ProfileService.completeMentorProfile({
        userId,
        bio: bio.trim(),
        birthDate: birthDate ? new Date(birthDate) : null,
        country,
        city,
        languages: parsedLanguages,
        domains: parsedDomains,
        skills: parsedSkills,
        profession: profession.trim(),
        yearsOfExperience,
        availability: parsedAvailability,
        socialLinks,
        photoFile: photo,
        cvFile: cv,
        documentFiles: documents,
      });

      res.status(200).json({
        success: true,
        message: "Profil mentor complété avec succès",
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }
}

//parse un champ envoyé en JSON string (multipart/form-data) ou déjà en array
function safeParseArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

//construit la liste des liens sociaux à partir des champs plats du form
function buildSocialLinks(links: {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
}) {
  const platforms: { platform: string; url: string }[] = [];
  if (links.linkedin)
    platforms.push({ platform: "LINKEDIN", url: links.linkedin });
  if (links.github) platforms.push({ platform: "GITHUB", url: links.github });
  if (links.portfolio)
    platforms.push({ platform: "WEBSITE", url: links.portfolio });
  if (links.website)
    platforms.push({ platform: "WEBSITE", url: links.website });
  return platforms;
}
