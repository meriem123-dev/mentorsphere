import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { generateToken } from "../utils/jwt";

//sel du hashage
const SALT_ROUNDS = 10;

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

//logique métier auth
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

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: data.role.toUpperCase() as "MENTOR" | "ENTREPRENEUR",
      },
    });

    const token = generateToken({ userId: user.id, role: user.role });
    const { password, ...safeUser } = user;

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

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      const error: any = new Error("Email ou mot de passe incorrect");
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({ userId: user.id, role: user.role });
    const { password, ...safeUser } = user;

    return { user: safeUser, token };
  }

  //métier me
static async getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
}
}