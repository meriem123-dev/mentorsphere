import jwt from "jsonwebtoken";

const JAAS_APP_ID = process.env.JAAS_APP_ID!;
const JAAS_KID = process.env.JAAS_KID!;
const JAAS_PRIVATE_KEY = process.env.JAAS_PRIVATE_KEY!.replace(/\\n/g, "\n");

type JaasUser = {
  id: string;
  name: string;
  email: string;
  moderator: boolean;
};

export function generateJaasToken(room: string, user: JaasUser) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: JAAS_APP_ID,
    room,
    exp: now + 60 * 60 * 2, // token valide 2h
    nbf: now - 10,
    context: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        moderator: user.moderator,
      },
      features: {
        recording: user.moderator,
        livestreaming: false,
        "outbound-call": false,
      },
    },
  };

  return jwt.sign(payload, JAAS_PRIVATE_KEY, {
    algorithm: "RS256",
    header: { kid: JAAS_KID, typ: "JWT", alg: "RS256" },
  });
}

export const jaasAppId = JAAS_APP_ID;