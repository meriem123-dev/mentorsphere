import prisma from "../lib/prisma";
import { getWorkspaceAccess, getWorkspaceOverview } from "./workspaceService";
import { randomUUID } from "crypto";
import { generateJaasToken, jaasAppId } from "../lib/jaas";
import { notifySessionCreated } from "../lib/n8n";

//helpers
function buildRoomName() {
  return `mentorsphere-${randomUUID()}`;
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

  

  await notifySessionCreated({
    sessionId: session.id,
    scheduledAt: session.scheduledAt,
    agenda: session.agenda,
    meetingUrl: session.meetingUrl,
    participants: session.participants.map((p) => ({
      email: p.user.email,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
    })),
  });

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

  return prisma.session.update({
    where: { id: sessionId },
    data: { status },
  });
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
  const { session: exists, access } = await getAccessBySessionId(
    sessionId,
    userId,
  );
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

  return session;
}

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
    select: { status: true },
  });
  if (!current) return null;
  if (current.status !== "SCHEDULED") {
    return "SESSION_NOT_EDITABLE" as const;
  }

  const data: {
    scheduledAt?: Date;
    durationMinutes?: number;
    agenda?: string;
  } = {};
  if (input.scheduledAt) data.scheduledAt = input.scheduledAt;
  if (input.durationMinutes) data.durationMinutes = input.durationMinutes;
  if (input.agenda !== undefined) data.agenda = input.agenda;

  return prisma.session.update({
    where: { id: sessionId },
    data,
  });
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

  return prisma.session.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });
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
