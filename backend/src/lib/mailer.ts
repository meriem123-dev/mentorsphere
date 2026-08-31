import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "MentorSphere <no-reply@mentorsphere.com>";

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  rawToken: string,
) {
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${rawToken}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Vérifiez votre adresse email - MentorSphere",
    html: `
      <p>Bonjour ${firstName},</p>
      <p>Merci de votre inscription sur MentorSphere. Confirmez votre adresse email en cliquant sur le lien ci-dessous :</p>
      <p><a href="${verifyUrl}">Vérifier mon email</a></p>
      <p>Ce lien expire dans 24 heures.</p>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  rawToken: string,
) {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Réinitialisation de votre mot de passe - MentorSphere",
    html: `
      <p>Bonjour ${firstName},</p>
      <p>Votre compte a été temporairement bloqué (ou vous avez demandé une réinitialisation).</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
  });
}