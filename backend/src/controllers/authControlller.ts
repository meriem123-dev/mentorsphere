import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

//options cookie pour le token JWT
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//AUTH CTLR
export class AuthController {
  //gérer http register
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, role } = req.body;
      const errors: Record<string, string> = {};

      if (!firstName || firstName.trim().length < 2) {
        errors.firstName = "Prénom requis (min 2 caractères)";
      }
      if (!lastName || lastName.trim().length < 2) {
        errors.lastName = "Nom requis (min 2 caractères)";
      }
      if (!email || !EMAIL_REGEX.test(email)) {
        errors.email = "Email invalide";
      }
      if (!password || password.length < 6) {
        errors.password = "Mot de passe requis (min 6 caractères)";
      }
      if (!role || !["entrepreneur", "mentor"].includes(role)) {
        errors.role = "Rôle invalide";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors,
        });
      }

      const { user, token } = await AuthService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      res.cookie("token", token, COOKIE_OPTIONS).status(201).json({
        success: true,
        message: "Compte créé avec succès",
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  //gérer http login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const errors: Record<string, string> = {};

      if (!email || !EMAIL_REGEX.test(email)) {
        errors.email = "Email invalide";
      }
      if (!password) {
        errors.password = "Mot de passe requis";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors,
        });
      }

      const { user, token } = await AuthService.login({
        email: email.trim().toLowerCase(),
        password,
      });

      res.cookie("token", token, COOKIE_OPTIONS).status(200).json({
        success: true,
        message: "Connexion réussie",
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  //gérer http logout
  static async logout(req: Request, res: Response) {
    res.clearCookie("token", CLEAR_COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: "Déconnexion réussie" });
  }

  //gérer http me
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getMe(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur introuvable",
        });
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  //modif pass
  static async updatePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const errors: Record<string, string> = {};
    if (!currentPassword) {
      errors.currentPassword = "Mot de passe actuel requis";
    }
    if (!newPassword || newPassword.length < 6) {
      errors.newPassword = "Nouveau mot de passe requis (min 6 caractères)";
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors,
      });
    }

    await AuthService.updatePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    next(error);
  }
}

//modif mail
static async updateEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { newEmail, currentPassword } = req.body;

    const errors: Record<string, string> = {};
    if (!newEmail || !EMAIL_REGEX.test(newEmail)) {
      errors.newEmail = "Email invalide";
    }
    if (!currentPassword) {
      errors.currentPassword = "Mot de passe actuel requis";
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors,
      });
    }

    const user = await AuthService.updateEmail(
      userId,
      newEmail.trim().toLowerCase(),
      currentPassword,
    );

    res.status(200).json({
      success: true,
      message: "Email mis à jour avec succès",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

}


