const MJ_API_KEY = process.env.MAILJET_API_KEY as string;
const MJ_SECRET_KEY = process.env.MAILJET_SECRET_KEY as string;
const MJ_API_URL = "https://api.mailjet.com/v3.1/send";

const FROM_EMAIL = process.env.EMAIL_FROM || "mentorsphere.platform@gmail.com";
const FROM_NAME = "MentorSphere";

function getAuthHeader() {
  const credentials = Buffer.from(`${MJ_API_KEY}:${MJ_SECRET_KEY}`).toString("base64");
  return `Basic ${credentials}`;
}

async function sendMailjetEmail(to: string, subject: string, html: string) {
  const response = await fetch(MJ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": getAuthHeader(),
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [{ Email: to }],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Mailjet API error (${response.status}): ${errorBody}`);
  }

  return response.json();
}

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  rawToken: string,
) {
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${rawToken}`;

  await sendMailjetEmail(
    to,
    "Vérifiez votre adresse email - MentorSphere",
    `
      <p>Bonjour ${firstName},</p>
      <p>Merci de votre inscription sur MentorSphere. Confirmez votre adresse email en cliquant sur le lien ci-dessous :</p>
      <p><a href="${verifyUrl}">Vérifier mon email</a></p>
      <p>Ce lien expire dans 24 heures.</p>
    `,
  );
}

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  rawToken: string,
) {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`;

  await sendMailjetEmail(
    to,
    "Réinitialisation de votre mot de passe - MentorSphere",
    `
      <p>Bonjour ${firstName},</p>
      <p>Votre compte a été temporairement bloqué (ou vous avez demandé une réinitialisation).</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
  );
}