import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    const error: any = new Error("Token Google invalide");
    error.statusCode = 401;
    throw error;
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    firstName: payload.given_name || "",
    lastName: payload.family_name || "",
    emailVerified: payload.email_verified ?? false,
  };
}