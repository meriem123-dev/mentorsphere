const N8N_WEBHOOK_URL = process.env.N8N_SESSION_CREATED_WEBHOOK_URL;
const N8N_CANCELLED_WEBHOOK_URL = process.env.N8N_SESSION_CANCELLED_WEBHOOK_URL;
const N8N_RESCHEDULED_WEBHOOK_URL = process.env.N8N_SESSION_RESCHEDULED_WEBHOOK_URL;
const N8N_REMINDER_WEBHOOK_URL = process.env.N8N_SESSION_REMINDER_WEBHOOK_URL;
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

type SessionParticipantPayload = {
  email: string;
  firstName: string;
  lastName: string;
  joinUrl: string;
};

type SessionCreatedPayload = {
  sessionId: string;
  scheduledAt: Date;
  agenda?: string | null;
  participants: SessionParticipantPayload[];
};

type SessionCancelledPayload = {
  sessionId: string;
  scheduledAt: Date;
  agenda?: string | null;
  participants: Omit<SessionParticipantPayload, "joinUrl">[];
};

type SessionRescheduledPayload = {
  sessionId: string;
  previousScheduledAt: Date;
  newScheduledAt: Date;
  agenda?: string | null;
  participants: SessionParticipantPayload[];
};

type SessionReminderPayload = {
  sessionId: string;
  scheduledAt: Date;
  agenda?: string | null;
  participants: SessionParticipantPayload[];
};

//fct générique d'envoi, réutilisée par toutes les notifs
async function postToN8n(url: string | undefined, payload: unknown) {
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": N8N_WEBHOOK_SECRET ?? "",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // on ne bloque jamais l'action métier si n8n est down
    console.error("n8n notify failed:", err);
  }
}

export async function notifySessionCreated(payload: SessionCreatedPayload) {
  await postToN8n(N8N_WEBHOOK_URL, payload);
}

export async function notifySessionCancelled(payload: SessionCancelledPayload) {
  await postToN8n(N8N_CANCELLED_WEBHOOK_URL, payload);
}

export async function notifySessionRescheduled(payload: SessionRescheduledPayload) {
  await postToN8n(N8N_RESCHEDULED_WEBHOOK_URL, payload);
}

export async function notifySessionReminder(payload: SessionReminderPayload) {
  await postToN8n(N8N_REMINDER_WEBHOOK_URL, payload);
}