import prisma from "../lib/prisma";
import { getWorkspaceAccess, getWorkspaceOverview } from "./workspaceService";

type CreateSessionInput = {
  scheduledAt: Date;
  durationMinutes: number;
  agenda?: string;
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
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
    },
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
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
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