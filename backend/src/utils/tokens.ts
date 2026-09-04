import crypto from "crypto";

const RAW_TOKEN_BYTES = 32;

// génère un token brut (envoyé par email) + sa version hashée (stockée en DB)
export function generateSecureToken() {
  const rawToken = crypto.randomBytes(RAW_TOKEN_BYTES).toString("hex");
  const hashedToken = hashToken(rawToken);
  return { rawToken, hashedToken };
}

export function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}