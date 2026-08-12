const N8N_WEBHOOK_URL = process.env.N8N_SESSION_CREATED_WEBHOOK_URL;
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

type SessionCreatedPayload = {
  sessionId: string;
  scheduledAt: Date;
  agenda?: string | null;
  meetingUrl: string | null;
  participants: { email: string; firstName: string; lastName: string }[];
};

export async function notifySessionCreated(payload: SessionCreatedPayload) {
  if (!N8N_WEBHOOK_URL) return;

  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": N8N_WEBHOOK_SECRET ?? "",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // on ne bloque jamais la création de session si n8n est down
    console.error("notifySessionCreated failed:", err);
  }
}