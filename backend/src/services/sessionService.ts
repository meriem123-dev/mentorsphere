import prisma from "../lib/prisma";
import { getWorkspaceAccess, getWorkspaceOverview } from "./workspaceService";
import { randomUUID } from "crypto";
import { generateJaasToken, jaasAppId } from "../lib/jaas";
import { notifySessionCancelled,notifySessionCompleted, notifySessionCreated, notifySessionRescheduled } from "../lib/n8n";
import { groq, GROQ_MODEL } from "../lib/groqClient";


//helpers
function buildRoomName() {
  return `mentorsphere-${randomUUID()}`;
}

function buildJoinUrl(
  role: "owner" | "mentor" | "collaborator",
  mentorshipId: string,
  sessionId: string,
) {
  const base = process.env.FRONTEND_URL;
  const prefix = role === "mentor" ? "mentor" : "entrepreneur";
  return `${base}/${prefix}/workspace/${mentorshipId}/sessions/${sessionId}/room`;
}

async function buildParticipantsPayload(
  mentorshipId: string,
  userId: string,
  sessionId: string,
  participants: { userId: string; user: { firstName: string; lastName: string; email: string } }[],
) {
  const overview = await getWorkspaceOverview(mentorshipId, userId);
  if (!overview || overview === "FORBIDDEN") return null;

  const roleByUserId = new Map(overview.members.map((m) => [m.userId, m.role]));

  return participants.map((p) => ({
    email: p.user.email,
    firstName: p.user.firstName,
    lastName: p.user.lastName,
    joinUrl: buildJoinUrl(
      roleByUserId.get(p.userId) ?? "collaborator",
      mentorshipId,
      sessionId,
    ),
  }));
}

async function getAccessBySessionId(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { mentorshipId: true },
  });
  if (!session) return { session: null, access: null };

  const access = await getWorkspaceAccess(session.mentorshipId, userId);
  return { session, access };
}

type CreateSessionInput = {
  scheduledAt: Date;
  durationMinutes: number;
  agenda?: string;
  meetingUrl?: string;
  participantIds: string[];
};

//métier création de session
export async function createSession(
  mentorshipId: string,
  userId: string,
  input: CreateSessionInput,
) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  if (!access.isMentor && !access.isOwner) {
    return "NOT_ALLOWED_TO_CREATE" as const;
  }

  const overview = await getWorkspaceOverview(mentorshipId, userId);
  if (!overview || overview === "FORBIDDEN") return "FORBIDDEN" as const;

  const validUserIds = new Set(overview.members.map((m) => m.userId));

  const invalidIds = input.participantIds.filter((id) => !validUserIds.has(id));
  if (invalidIds.length > 0) {
    return { error: "INVALID_PARTICIPANTS", invalidIds } as const;
  }

  // auto-inclusion du créateur + dédoublonnage
  const finalParticipantIds = Array.from(
    new Set([userId, ...input.participantIds]),
  );

  const sessionCount = await prisma.session.count({ where: { mentorshipId } });

  const session = await prisma.session.create({
    data: {
      number: sessionCount + 1,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      agenda: input.agenda ?? null,
      meetingUrl: input.meetingUrl ?? buildRoomName(),
      mentorshipId,
      createdById: userId,
      participants: {
        create: finalParticipantIds.map((participantUserId) => ({
          userId: participantUserId,
        })),
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  const roleByUserId = new Map(overview.members.map((m) => [m.userId, m.role]));

  const payloadToSend = {
    sessionId: session.id,
    scheduledAt: session.scheduledAt,
    agenda: session.agenda,
    participants: session.participants.map((p) => ({
      email: p.user.email,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      joinUrl: buildJoinUrl(
        roleByUserId.get(p.userId) ?? "collaborator",
        mentorshipId,
        session.id,
      ),
    })),
  };


  await notifySessionCreated(payloadToSend);

  return session;
}

//métier recup sessions
export async function listSessions(mentorshipId: string, userId: string) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  const sessions = await prisma.session.findMany({
    where: { mentorshipId },
    orderBy: { createdAt: "asc" },
    include: {
      participants: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  return sessions.map((s) => ({
    ...s,
    participants: s.participants.map((p) => ({
      userId: p.userId,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      email: p.user.email,
    })),
  }));
}

//métier changement de statut
export async function updateSessionStatus(
  sessionId: string,
  userId: string,
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED",
) {
  const { session, access } = await getAccessBySessionId(sessionId, userId);
  if (!session) return null;
  if (!access || access === "FORBIDDEN") return "FORBIDDEN" as const;
  if (!access.isMentor) return "NOT_ALLOWED_TO_CREATE" as const;

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { status },
    include: {
      participants: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
    },
  });

  if (status === "COMPLETED" && updated.rawNotes && updated.rawNotes.trim().length > 0) {
    const summary = await generateAISummaryContent(updated.rawNotes, updated.agenda);

    if (summary) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { aiSummary: summary },
      });

      const participantsPayload = await buildParticipantsPayload(
        session.mentorshipId,
        userId,
        updated.id,
        updated.participants,
      );

      if (participantsPayload) {
        await notifySessionCompleted({
          sessionId: updated.id,
          scheduledAt: updated.scheduledAt,
          agenda: updated.agenda,
          summary,
          participants: participantsPayload.map(({ joinUrl, ...rest }) => rest),
        });
      }
    }
  }

  return updated;
}

//métier notes partagées
export async function updateSessionNotes(
  sessionId: string,
  userId: string,
  rawNotes: string,
) {
  const { session, access } = await getAccessBySessionId(sessionId, userId);
  if (!session) return null;
  if (!access || access === "FORBIDDEN") return "FORBIDDEN" as const;

  return prisma.session.update({
    where: { id: sessionId },
    data: { rawNotes },
  });
}

//métier recup d'une session (room + notes)
export async function getSessionById(sessionId: string, userId: string) {
  const { session: exists, access } = await getAccessBySessionId(sessionId, userId);
  if (!exists) return null;
  if (!access || access === "FORBIDDEN") return "FORBIDDEN" as const;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      participants: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  });
  if (!session) return null;

  return {
    ...session,
    participants: session.participants.map((p) => ({
      userId: p.userId,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      email: p.user.email,
    })),
  };
}

//métier recup des credentials pour rejoindre la room (JaaS)
export async function getSessionRoomCredentials(
  sessionId: string,
  userId: string,
) {
  const { session: exists, access } = await getAccessBySessionId(
    sessionId,
    userId,
  );
  if (!exists) return null;
  if (!access || access === "FORBIDDEN") return "FORBIDDEN" as const;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { meetingUrl: true, number: true },
  });
  if (!session) return null;
  if (!session.meetingUrl) return "NO_ROOM" as const;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true },
  });
  if (!user) return null;

  const token = generateJaasToken(session.meetingUrl, {
    id: userId,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    moderator: access.isMentor || access.isOwner,
  });

  return {
    appId: jaasAppId,
    room: session.meetingUrl,
    token,
    sessionNumber: session.number,
  };
}

type RescheduleSessionInput = {
  scheduledAt?: Date | undefined;
  durationMinutes?: number | undefined;
  agenda?: string | undefined;
};

//métier reprogrammation
export async function rescheduleSession(
  sessionId: string,
  userId: string,
  input: RescheduleSessionInput,
) {
  const { session, access } = await getAccessBySessionId(sessionId, userId);
  if (!session) return null;
  if (!access || access === "FORBIDDEN") return "FORBIDDEN" as const;
  if (!access.isMentor && !access.isOwner) {
    return "NOT_ALLOWED_TO_RESCHEDULE" as const;
  }

  const current = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { status: true, scheduledAt: true },
  });
  if (!current) return null;
  if (current.status !== "SCHEDULED") {
    return "SESSION_NOT_EDITABLE" as const;
  }

  const previousScheduledAt = current.scheduledAt;

  const data: {
    scheduledAt?: Date;
    durationMinutes?: number;
    agenda?: string;
  } = {};
  if (input.scheduledAt) data.scheduledAt = input.scheduledAt;
  if (input.durationMinutes) data.durationMinutes = input.durationMinutes;
  if (input.agenda !== undefined) data.agenda = input.agenda;

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data,
    include: {
      participants: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
    },
  });

  const participantsPayload = await buildParticipantsPayload(
    session.mentorshipId,
    userId,
    updated.id,
    updated.participants,
  );

  if (participantsPayload && input.scheduledAt) {
    await notifySessionRescheduled({
      sessionId: updated.id,
      previousScheduledAt,
      newScheduledAt: updated.scheduledAt,
      agenda: updated.agenda,
      participants: participantsPayload,
    });
  }

  return updated;
}

//métier annulation
export async function cancelSession(sessionId: string, userId: string) {
  const { session, access } = await getAccessBySessionId(sessionId, userId);
  if (!session) return null;
  if (!access || access === "FORBIDDEN") return "FORBIDDEN" as const;
  if (!access.isMentor && !access.isOwner) {
    return "NOT_ALLOWED_TO_CANCEL" as const;
  }

  const current = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { status: true },
  });
  if (!current) return null;
  if (current.status === "COMPLETED") {
    return "SESSION_ALREADY_COMPLETED" as const;
  }
  if (current.status === "CANCELLED") {
    return "SESSION_ALREADY_CANCELLED" as const;
  }

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
    include: {
      participants: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
    },
  });

  const participantsPayload = await buildParticipantsPayload(
    session.mentorshipId,
    userId,
    updated.id,
    updated.participants,
  );

  if (participantsPayload) {
    await notifySessionCancelled({
      sessionId: updated.id,
      scheduledAt: updated.scheduledAt,
      agenda: updated.agenda,
      participants: participantsPayload.map(({ joinUrl, ...rest }) => rest),
    });
  }

  return updated;
}

//métier suppression définitive
export async function deleteSession(sessionId: string, userId: string) {
  const { session, access } = await getAccessBySessionId(sessionId, userId);
  if (!session) return null;
  if (!access || access === "FORBIDDEN") return "FORBIDDEN" as const;

  const existing = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { createdById: true, status: true },
  });
  if (!existing) return null;

  const isCreator = existing.createdById === userId;
  if (!isCreator && !access.isMentor) {
    return "NOT_ALLOWED_TO_DELETE" as const;
  }
  if (existing.status === "COMPLETED") {
    return "SESSION_COMPLETED_LOCKED" as const;
  }

  //vider la relation participants via le champ imbriqué
  await prisma.session.update({
    where: { id: sessionId },
    data: { participants: { deleteMany: {} } },
  });
  await prisma.session.delete({ where: { id: sessionId } });

  return { success: true } as const;
}

//métier: sessions dont le rappel 1h est dû, marque reminderSentAt de façon atomique
export async function getAndMarkDueReminders() {
  const now = new Date();
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
  const in70Min = new Date(now.getTime() + 70 * 60 * 1000); // fenêtre de tolérance

  const dueSessions = await prisma.session.findMany({
    where: {
      status: "SCHEDULED",
      reminderSentAt: null,
      scheduledAt: { gte: in1Hour, lte: in70Min },
    },
    include: {
      participants: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
    },
  });

  if (dueSessions.length === 0) return [];

  // marquer immédiatement pour éviter les doublons si n8n relance avant la fin du traitement
  await prisma.session.updateMany({
    where: { id: { in: dueSessions.map((s) => s.id) } },
    data: { reminderSentAt: now },
  });

  const results = [];
  for (const s of dueSessions) {
    const participantsPayload = await buildParticipantsPayload(
      s.mentorshipId,
      s.createdById,
      s.id,
      s.participants,
    );
    if (participantsPayload) {
      results.push({
        sessionId: s.id,
        scheduledAt: s.scheduledAt,
        agenda: s.agenda,
        participants: participantsPayload,
      });
    }
  }

  return results;
}

type SessionAISummary = {
  objectifsAtteints: string[];
  pointsCles: string[];
  prochainesActions: string[];
};

//helper partagé: appel Groq + parsing, réutilisé par génération manuelle et auto
async function generateAISummaryContent(
  rawNotes: string,
  agenda: string | null,
): Promise<SessionAISummary | null> {
  const prompt = `
Voici les notes prises lors d'une session de mentorat${agenda ? ` (agenda: ${agenda})` : ""}:

${rawNotes}

Réponds UNIQUEMENT en JSON valide, sans markdown, avec ce format exact:
{
  "objectifsAtteints": ["..."],
  "pointsCles": ["..."],
  "prochainesActions": ["..."]
}
Base-toi uniquement sur les notes fournies, sans inventer d'informations. Chaque tableau peut être vide si rien de pertinent n'est mentionné. Rédige en français, de façon concise (une phrase courte par élément).
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      objectifsAtteints: Array.isArray(parsed.objectifsAtteints) ? parsed.objectifsAtteints : [],
      pointsCles: Array.isArray(parsed.pointsCles) ? parsed.pointsCles : [],
      prochainesActions: Array.isArray(parsed.prochainesActions) ? parsed.prochainesActions : [],
    };
  } catch (err) {
    console.error("generateAISummaryContent JSON parse error:", err, "raw:", raw);
    return null;
  }
}

//métier génération résumé IA à partir des notes de session
export async function generateSessionAISummary(sessionId: string, userId: string) {
  const { session, access } = await getAccessBySessionId(sessionId, userId);
  if (!session) return null;
  if (!access || access === "FORBIDDEN") return "FORBIDDEN" as const;

  const current = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { status: true, rawNotes: true, agenda: true },
  });
  if (!current) return null;

  if (current.status !== "COMPLETED") return "SESSION_NOT_COMPLETED" as const;
  if (!current.rawNotes || current.rawNotes.trim().length === 0) return "NO_NOTES" as const;

  const summary = await generateAISummaryContent(current.rawNotes, current.agenda);
  if (!summary) return "AI_GENERATION_FAILED" as const;

  return prisma.session.update({
    where: { id: sessionId },
    data: { aiSummary: summary },
  });
}