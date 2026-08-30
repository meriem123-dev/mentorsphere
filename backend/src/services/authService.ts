import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { generateToken } from "../utils/jwt";
import { generateSecureToken, hashToken } from "../utils/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/mailer";
import { verifyGoogleIdToken } from "../lib/googlAuth";

const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1h

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "entrepreneur" | "mentor";
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  //métier register
  static async register(data: RegisterData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const error: any = new Error("Un compte existe déjà avec cet email");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const { rawToken, hashedToken } = generateSecureToken();

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: data.role.toUpperCase() as "MENTOR" | "ENTREPRENEUR",
        authProvider: "LOCAL",
        emailVerificationToken: hashedToken,
        emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS),
      },
    });

    // on ne bloque jamais l'inscription si l'envoi d'email échoue
    try {
      await sendVerificationEmail(user.email, user.firstName, rawToken);
    } catch (err) {
      console.error("Échec de l'envoi de l'email de vérification :", err);
    }

    const token = generateToken({ userId: user.id, role: user.role });
    const { password, emailVerificationToken, passwordResetToken, ...safeUser } = user;

    return { user: safeUser, token };
  }

  //métier login
  static async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      const error: any = new Error("Email ou mot de passe incorrect");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error: any = new Error("Ce compte a été désactivé");
      error.statusCode = 403;
      throw error;
    }

    if (user.authProvider === "GOOGLE" && !user.password) {
      const error: any = new Error("Ce compte utilise la connexion Google");
      error.statusCode = 400;
      throw error;
    }

    if (user.isLocked) {
      const error: any = new Error(
        "Compte bloqué après plusieurs tentatives échouées. Veuillez réinitialiser votre mot de passe.",
      );
      error.statusCode = 423;
      throw error;
    }

    const isValid = await bcrypt.compare(data.password, user.password!);

    if (!isValid) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: shouldLock
          ? await AuthService.buildLockUpdate()
          : { failedLoginAttempts: attempts },
      });

      if (shouldLock) {
        try {
          const { rawToken } = generateSecureToken();
          // on régénère le token dans buildLockUpdate et on renvoie le rawToken associé
          await sendPasswordResetEmail(updated.email, updated.firstName, rawToken);
        } catch (err) {
          console.error("Échec de l'envoi de l'email de blocage :", err);
        }

        const error: any = new Error(
          "Compte bloqué après 5 tentatives échouées. Un email de réinitialisation vous a été envoyé.",
        );
        error.statusCode = 423;
        throw error;
      }

      const error: any = new Error("Email ou mot de passe incorrect");
      error.statusCode = 401;
      throw error;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0 },
    });

    const token = generateToken({ userId: updatedUser.id, role: updatedUser.role });
    const { password, emailVerificationToken, passwordResetToken, ...safeUser } = updatedUser;

    return { user: safeUser, token };
  }

  // construit l'update de verrouillage ET place le token de reset associé
  private static async buildLockUpdate() {
    const { hashedToken } = generateSecureToken();
    return {
      isLocked: true,
      failedLoginAttempts: MAX_LOGIN_ATTEMPTS,
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS),
    };
  }

  //métier me
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const { password, emailVerificationToken, passwordResetToken, ...safeUser } = user;
    return safeUser;
  }

  //métier update password
  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      const error: any = new Error("Utilisateur introuvable");
      error.statusCode = 404;
      throw error;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      const error: any = new Error("Mot de passe actuel incorrect");
      error.statusCode = 401;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  //métier update email
  static async updateEmail(
    userId: string,
    newEmail: string,
    currentPassword: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      const error: any = new Error("Utilisateur introuvable");
      error.statusCode = 404;
      throw error;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      const error: any = new Error("Mot de passe incorrect");
      error.statusCode = 401;
      throw error;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existingUser && existingUser.id !== userId) {
      const error: any = new Error("Cet email est déjà utilisé");
      error.statusCode = 409;
      throw error;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    const { password, emailVerificationToken, passwordResetToken, ...safeUser } = updatedUser;
    return safeUser;
  }

  //métier vérification email
  static async verifyEmail(rawToken: string) {
    const hashedToken = hashToken(rawToken);

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: hashedToken },
    });

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      const error: any = new Error("Lien de vérification invalide ou expiré");
      error.statusCode = 400;
      throw error;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
  }

  //métier renvoyer email de vérification
  static async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const error: any = new Error("Utilisateur introuvable");
      error.statusCode = 404;
      throw error;
    }

    if (user.isEmailVerified) {
      const error: any = new Error("Cet email est déjà vérifié");
      error.statusCode = 400;
      throw error;
    }

    const { rawToken, hashedToken } = generateSecureToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS),
      },
    });

    await sendVerificationEmail(user.email, user.firstName, rawToken);
  }

    //métier mot de passe oublié
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    //anti email-enumeration
    if (!user || user.authProvider === "GOOGLE") {
      return;
    }

    const { rawToken, hashedToken } = generateSecureToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS),
      },
    });

    try {
      await sendPasswordResetEmail(user.email, user.firstName, rawToken);
    } catch (err) {
      console.error("Échec de l'envoi de l'email de réinitialisation :", err);
    }
  }

  //métier réinitialiser mot de passe
  static async resetPassword(rawToken: string, newPassword: string) {
    const hashedToken = hashToken(rawToken);

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: hashedToken },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      const error: any = new Error("Lien de réinitialisation invalide ou expiré");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        isLocked: false,
        failedLoginAttempts: 0,
      },
    });
  }

  //métier Google auth
  static async googleAuth(idToken: string, role?: "entrepreneur" | "mentor") {
    const profile = await verifyGoogleIdToken(idToken);

    let user = await prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingByEmail) {
        // compte local existant avec le même email -> on lie le compte Google
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: profile.googleId,
            isEmailVerified: true,
          },
        });
      } else {
        if (!role) {
          const error: any = new Error("Le rôle est requis pour créer un compte");
          error.statusCode = 400;
          throw error;
        }

        user = await prisma.user.create({
          data: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            role: role.toUpperCase() as "MENTOR" | "ENTREPRENEUR",
            authProvider: "GOOGLE",
            googleId: profile.googleId,
            isEmailVerified: true,
          },
        });
      }
    }

    if (!user.isActive) {
      const error: any = new Error("Ce compte a été désactivé");
      error.statusCode = 403;
      throw error;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0, isLocked: false },
    });

    const token = generateToken({ userId: updatedUser.id, role: updatedUser.role });
    const { password, emailVerificationToken, passwordResetToken, ...safeUser } = updatedUser;

    return { user: safeUser, token };
  }
}