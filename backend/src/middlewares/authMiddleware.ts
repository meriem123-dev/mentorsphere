import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

// étend le type Request d'Express pour y ajouter `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

//vérifie que le JWT est présent et valide
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentification requise",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, role }
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session invalide ou expirée",
    });
  }
};

//vérifie que l'utilisateur a le bon rôle (ex: MENTOR uniquement)
export const requireRole = (...roles: JwtPayload["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé",
      });
    }
    next();
  };
};