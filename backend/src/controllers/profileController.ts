import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profileService";
import {
  ALLOWED_MENTOR_DOMAINS,
  ALLOWED_ENTREPRENEUR_DOMAINS,
  ALLOWED_ENTREPRENEUR_PROFESSIONS,
  ALLOWED_LEVELS,
  ALLOWED_YEARS_OF_EXPERIENCE,
  ALLOWED_AVAILABILITY,
  ALLOWED_LOOKING_FOR,
  findInvalidValues,
} from "../constants/profileOptions";

const ALLOWED_AVATAR_COLORS = [
  "bg-brand-blue",
  "bg-brand-rose",
  "bg-brand-blue-light",
  "bg-brand-rose-light",
  "bg-gradient-brand",
  "bg-gradient-rose-fade",
];

export class ProfileController {
  //compléter le profil entrepreneur (wizard)
  static async completeEntrepreneurProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.userId;
      const existingUser = await ProfileService.getUserById(userId);
      if (existingUser?.profileCompleted) {
        return res.status(409).json({
          success: false,
          message: "Le profil a déjà été complété",
        });
      }
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
        avatarColor,
      } = req.body;

      const errors: Record<string, string> = {};

      if (avatarColor && !ALLOWED_AVATAR_COLORS.includes(avatarColor)) {
        errors.avatarColor = "Couleur d'avatar invalide";
      }

      if (!bio || bio.trim().length < 10) {
        errors.bio = "Biographie requise (min 10 caractères)";
      }
      if (!birthDate) {
        errors.birthDate = "Date de naissance requise";
      } else {
        const date = new Date(birthDate);
        if (isNaN(date.getTime()) || calculateAge(date) < 15) {
          errors.birthDate = "Vous devez avoir au moins 15 ans";
        }
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

      if (
        profession &&
        !ALLOWED_ENTREPRENEUR_PROFESSIONS.includes(profession)
      ) {
        errors.profession = "Profession invalide";
      }
      if (level && !ALLOWED_LEVELS.includes(level)) {
        errors.level = "Niveau entrepreneurial invalide";
      }
      const invalidDomains = findInvalidValues(
        parsedDomains,
        ALLOWED_ENTREPRENEUR_DOMAINS,
      );
      if (invalidDomains.length > 0) {
        errors.domains = `Domaines invalides: ${invalidDomains.join(", ")}`;
      }
      const invalidLookingFor = findInvalidValues(
        parsedLookingFor,
        ALLOWED_LOOKING_FOR,
      );
      if (invalidLookingFor.length > 0) {
        errors.lookingFor = `Valeurs invalides: ${invalidLookingFor.join(", ")}`;
      }
      const invalidAvailability = findInvalidValues(
        parsedAvailability,
        ALLOWED_AVAILABILITY,
      );
      if (invalidAvailability.length > 0) {
        errors.availability = `Disponibilités invalides: ${invalidAvailability.join(", ")}`;
      }

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
        birthDate: new Date(birthDate),
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
        avatarColor: photo ? null : avatarColor || null, // photo prioritaire si les deux arrivent
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
      const existingUser = await ProfileService.getUserById(userId);
      if (existingUser?.profileCompleted) {
        return res.status(409).json({
          success: false,
          message: "Le profil a déjà été complété",
        });
      }

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
        avatarColor,
      } = req.body;

      const errors: Record<string, string> = {};

      if (avatarColor && !ALLOWED_AVATAR_COLORS.includes(avatarColor)) {
        errors.avatarColor = "Couleur d'avatar invalide";
      }

      if (!bio || bio.trim().length < 10) {
        errors.bio = "Biographie requise (min 10 caractères)";
      }
      if (!birthDate) {
        errors.birthDate = "Date de naissance requise";
      } else {
        const date = new Date(birthDate);
        if (isNaN(date.getTime()) || calculateAge(date) < 15) {
          errors.birthDate = "Vous devez avoir au moins 15 ans";
        }
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

      const invalidDomains = findInvalidValues(
        parsedDomains,
        ALLOWED_MENTOR_DOMAINS,
      );
      if (invalidDomains.length > 0) {
        errors.domains = `Domaines invalides: ${invalidDomains.join(", ")}`;
      }
      if (
        yearsOfExperience &&
        !ALLOWED_YEARS_OF_EXPERIENCE.includes(yearsOfExperience)
      ) {
        errors.yearsOfExperience = "Années d'expérience invalides";
      }
      const invalidAvailability = findInvalidValues(
        parsedAvailability,
        ALLOWED_AVAILABILITY,
      );
      if (invalidAvailability.length > 0) {
        errors.availability = `Disponibilités invalides: ${invalidAvailability.join(", ")}`;
      }

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
        birthDate: new Date(birthDate),
        country,
        city,
        languages: parsedLanguages,
        domains: parsedDomains,
        skills: parsedSkills,
        profession: profession.trim(),
        yearsOfExperience,
        availability: parsedAvailability,
        socialLinks,
        avatarColor: photo ? null : avatarColor || null, // photo prioritaire si les deux arrivent
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

  //modifier le profil entrepreneur
  static async updateEntrepreneurProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.userId;

      const {
        firstName,
        lastName,
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
        avatarColor,
        removePhoto,
        removeCv,
        removeDocumentIds,
      } = req.body;

      const errors: Record<string, string> = {};

      if (avatarColor && !ALLOWED_AVATAR_COLORS.includes(avatarColor)) {
        errors.avatarColor = "Couleur d'avatar invalide";
      }

      if (firstName !== undefined && !firstName.trim()) {
        errors.firstName = "Le prénom ne peut pas être vide";
      }
      if (lastName !== undefined && !lastName.trim()) {
        errors.lastName = "Le nom ne peut pas être vide";
      }

      if (bio !== undefined && bio.trim().length < 10) {
        errors.bio = "Biographie requise (min 10 caractères)";
      }

      if (birthDate !== undefined) {
        const date = new Date(birthDate);
        if (isNaN(date.getTime()) || calculateAge(date) < 15) {
          errors.birthDate = "Vous devez avoir au moins 15 ans";
        }
      }

      const parsedLanguages =
        languages !== undefined ? safeParseArray(languages) : undefined;
      const parsedDomains =
        domains !== undefined ? safeParseArray(domains) : undefined;
      const parsedSkills =
        skills !== undefined ? safeParseArray(skills) : undefined;
      const parsedLookingFor =
        lookingFor !== undefined ? safeParseArray(lookingFor) : undefined;
      const parsedAvailability =
        availability !== undefined ? safeParseArray(availability) : undefined;

      if (
        profession !== undefined &&
        profession &&
        !ALLOWED_ENTREPRENEUR_PROFESSIONS.includes(profession)
      ) {
        errors.profession = "Profession invalide";
      }
      if (level !== undefined && level && !ALLOWED_LEVELS.includes(level)) {
        errors.level = "Niveau entrepreneurial invalide";
      }
      if (parsedDomains !== undefined) {
        const invalidDomains = findInvalidValues(
          parsedDomains,
          ALLOWED_ENTREPRENEUR_DOMAINS,
        );
        if (invalidDomains.length > 0) {
          errors.domains = `Domaines invalides: ${invalidDomains.join(", ")}`;
        }
      }
      if (parsedLookingFor !== undefined) {
        const invalidLookingFor = findInvalidValues(
          parsedLookingFor,
          ALLOWED_LOOKING_FOR,
        );
        if (invalidLookingFor.length > 0) {
          errors.lookingFor = `Valeurs invalides: ${invalidLookingFor.join(", ")}`;
        }
      }
      if (parsedAvailability !== undefined) {
        const invalidAvailability = findInvalidValues(
          parsedAvailability,
          ALLOWED_AVAILABILITY,
        );
        if (invalidAvailability.length > 0) {
          errors.availability = `Disponibilités invalides: ${invalidAvailability.join(", ")}`;
        }
      }

      if (parsedLanguages !== undefined && parsedLanguages.length === 0) {
        errors.languages = "Au moins une langue requise";
      }
      if (parsedDomains !== undefined && parsedDomains.length === 0) {
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
      const shouldRemovePhoto = removePhoto === "true" || removePhoto === true;
      const socialLinks =
        linkedin !== undefined ||
        github !== undefined ||
        portfolio !== undefined
          ? buildSocialLinks({ linkedin, github, portfolio })
          : undefined;

      const parsedRemoveDocumentIds = removeDocumentIds
        ? safeParseArray(removeDocumentIds)
        : [];

      const updatedUser = await ProfileService.updateEntrepreneurProfile({
        userId,
        ...(firstName !== undefined ? { firstName: firstName.trim() } : {}),
        ...(lastName !== undefined ? { lastName: lastName.trim() } : {}),
        ...(bio !== undefined ? { bio: bio.trim() } : {}),
        ...(birthDate !== undefined ? { birthDate: new Date(birthDate) } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(parsedLanguages !== undefined
          ? { languages: parsedLanguages }
          : {}),
        ...(parsedDomains !== undefined ? { domains: parsedDomains } : {}),
        ...(parsedSkills !== undefined ? { skills: parsedSkills } : {}),
        ...(profession !== undefined ? { profession: profession || null } : {}),
        ...(level !== undefined ? { level: level || null } : {}),
        ...(parsedLookingFor !== undefined
          ? { lookingFor: parsedLookingFor }
          : {}),
        ...(parsedAvailability !== undefined
          ? { availability: parsedAvailability }
          : {}),
        ...(socialLinks !== undefined ? { socialLinks } : {}),
        ...(shouldRemovePhoto
          ? { removePhoto: true, avatarColor: avatarColor || null }
          : photo
            ? { avatarColor: null }
            : avatarColor !== undefined
              ? { avatarColor }
              : {}),
        ...(photo ? { photoFile: photo } : {}),
        ...(cv ? { cvFile: cv } : {}),
        ...(documents.length ? { documentFiles: documents } : {}),
        ...(removeCv === "true" || removeCv === true ? { removeCv: true } : {}),
        ...(parsedRemoveDocumentIds.length
          ? { removeDocumentIds: parsedRemoveDocumentIds }
          : {}),
      });

      res.status(200).json({
        success: true,
        message: "Profil entrepreneur mis à jour avec succès",
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  //modifier le profil mentor
  static async updateMentorProfile(
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
        avatarColor,
        removePhoto,
        removeCv,
        removeDocumentIds,
      } = req.body;

      const errors: Record<string, string> = {};

      if (avatarColor && !ALLOWED_AVATAR_COLORS.includes(avatarColor)) {
        errors.avatarColor = "Couleur d'avatar invalide";
      }

      if (bio !== undefined && bio.trim().length < 10) {
        errors.bio = "Biographie requise (min 10 caractères)";
      }

      if (birthDate !== undefined) {
        const date = new Date(birthDate);
        if (isNaN(date.getTime()) || calculateAge(date) < 15) {
          errors.birthDate = "Vous devez avoir au moins 15 ans";
        }
      }

      if (profession !== undefined && profession.trim().length < 2) {
        errors.profession = "Profession requise";
      }

      const parsedLanguages =
        languages !== undefined ? safeParseArray(languages) : undefined;
      const parsedDomains =
        domains !== undefined ? safeParseArray(domains) : undefined;

      const parsedSkills =
        skills !== undefined ? safeParseArray(skills) : undefined;
      const parsedAvailability =
        availability !== undefined ? safeParseArray(availability) : undefined;

      if (parsedDomains !== undefined && parsedDomains.length === 0) {
        errors.domains = "Au moins un domaine d'expertise requis";
      }

      if (parsedDomains !== undefined) {
        const invalidDomains = findInvalidValues(
          parsedDomains,
          ALLOWED_MENTOR_DOMAINS,
        );
        if (invalidDomains.length > 0) {
          errors.domains = `Domaines invalides: ${invalidDomains.join(", ")}`;
        }
      }
      if (
        yearsOfExperience !== undefined &&
        yearsOfExperience &&
        !ALLOWED_YEARS_OF_EXPERIENCE.includes(yearsOfExperience)
      ) {
        errors.yearsOfExperience = "Années d'expérience invalides";
      }
      if (parsedAvailability !== undefined) {
        const invalidAvailability = findInvalidValues(
          parsedAvailability,
          ALLOWED_AVAILABILITY,
        );
        if (invalidAvailability.length > 0) {
          errors.availability = `Disponibilités invalides: ${invalidAvailability.join(", ")}`;
        }
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
      const shouldRemovePhoto = removePhoto === "true" || removePhoto === true;
      const parsedRemoveDocumentIds = removeDocumentIds
        ? safeParseArray(removeDocumentIds)
        : [];

      const socialLinks =
        linkedin !== undefined ||
        github !== undefined ||
        portfolio !== undefined ||
        website !== undefined
          ? buildSocialLinks({ linkedin, github, portfolio, website })
          : undefined;

      const updatedUser = await ProfileService.updateMentorProfile({
        userId,
        ...(bio !== undefined ? { bio: bio.trim() } : {}),
        ...(birthDate !== undefined ? { birthDate: new Date(birthDate) } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(parsedLanguages !== undefined
          ? { languages: parsedLanguages }
          : {}),
        ...(parsedDomains !== undefined ? { domains: parsedDomains } : {}),
        ...(parsedSkills !== undefined ? { skills: parsedSkills } : {}),
        ...(profession !== undefined ? { profession: profession.trim() } : {}),
        ...(yearsOfExperience !== undefined ? { yearsOfExperience } : {}),
        ...(parsedAvailability !== undefined
          ? { availability: parsedAvailability }
          : {}),
        ...(socialLinks !== undefined ? { socialLinks } : {}),
        ...(shouldRemovePhoto
          ? { removePhoto: true, avatarColor: avatarColor || null }
          : photo
            ? { avatarColor: null }
            : avatarColor !== undefined
              ? { avatarColor }
              : {}),
        ...(photo ? { photoFile: photo } : {}),
        ...(cv ? { cvFile: cv } : {}),
        ...(documents.length ? { documentFiles: documents } : {}),
        ...(removeCv === "true" || removeCv === true ? { removeCv: true } : {}),
        ...(parsedRemoveDocumentIds.length
          ? { removeDocumentIds: parsedRemoveDocumentIds }
          : {}),
      });
      [];
      res.status(200).json({
        success: true,
        message: "Profil mentor mis à jour avec succès",
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  // recup profil complet
  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role as "MENTOR" | "ENTREPRENEUR";

      const profile =
        role === "ENTREPRENEUR"
          ? await ProfileService.getFullEntrepreneurProfile(userId)
          : await ProfileService.getFullMentorProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profil introuvable",
        });
      }

      res.status(200).json({ success: true, data: { profile } });
    } catch (error) {
      next(error);
    }
  }
}

//parse un champ envoyé en JSON string
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
    platforms.push({ platform: "PORTFOLIO", url: links.portfolio }); // était WEBSITE
  if (links.website)
    platforms.push({ platform: "WEBSITE", url: links.website });
  return platforms;
}

//calcule l'âge exact à partir d'une date de naissance
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
