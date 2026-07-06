import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

//options cookie pour le token JWT
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
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
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Déconnexion réussie" });
  }
}