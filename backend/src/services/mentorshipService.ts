import prisma from "../lib/prisma";

interface CreateMentorshipParams {
  userId: string; // userId de l'entrepreneur connecté
  mentorId: string; // id du Mentor
  startupId: string;
  message: string;
}

//métier créer demande
export const createMentorshipRequest = async ({
  userId,
  mentorId,
  startupId,
  message,
}: CreateMentorshipParams) => {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
  });
  if (!entrepreneur) throw new Error("ENTREPRENEUR_NOT_FOUND");

  // vérifie que la startup appartient bien à cet entrepreneur
  const startup = await prisma.startup.findFirst({
    where: { id: startupId, entrepreneurId: entrepreneur.id },
  });
  if (!startup) throw new Error("STARTUP_NOT_OWNED");

  // empêche les doublons de demande en attente pour la même startup/mentor
  const existing = await prisma.mentorship.findFirst({
    where: {
      mentorId,
      entrepreneurId: entrepreneur.id,
      startupId,
      status: "PENDING",
    },
  });
  if (existing) throw new Error("REQUEST_ALREADY_EXISTS");

  return prisma.mentorship.create({
    data: {
      mentorId,
      entrepreneurId: entrepreneur.id,
      startupId,
      message,
      status: "PENDING",
    },
    include: {
      startup: { select: { id: true, name: true, stage: true, domain: true } },
    },
  });
};

//métier recup demandes
export const getReceivedRequests = async (userId: string, status?: string) => {
  const mentor = await prisma.mentor.findUnique({ where: { userId } });
  if (!mentor) throw new Error("MENTOR_NOT_FOUND");

  return prisma.mentorship.findMany({
    where: {
      mentorId: mentor.id,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      startup: {
        select: {
          id: true,
          name: true,
          stage: true,
          domain: true,
          description: true,
        },
      },
      entrepreneur: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              coverPicture: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

//recup demandes sent
export const getSentRequests = async (userId: string) => {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
  });
  if (!entrepreneur) throw new Error("ENTREPRENEUR_NOT_FOUND");

  return prisma.mentorship.findMany({
    where: { entrepreneurId: entrepreneur.id },
    include: {
      startup: { select: { id: true, name: true, stage: true, domain: true } },
      mentor: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              coverPicture: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

//accepter ou refuse
export const respondToRequest = async (
  mentorshipId: string,
  userId: string,
  accept: boolean,
) => {
  const mentor = await prisma.mentor.findUnique({ where: { userId } });
  if (!mentor) throw new Error("MENTOR_NOT_FOUND");

  const mentorship = await prisma.mentorship.findFirst({
    where: { id: mentorshipId, mentorId: mentor.id },
  });
  if (!mentorship) return null;

  return prisma.mentorship.update({
    where: { id: mentorshipId },
    data: { status: accept ? "ACCEPTED" : "REJECTED" },
    include: {
      startup: { select: { id: true, name: true, stage: true, domain: true } },
    },
  });
};

type MenteeStatus = "actif" | "inactif";
const INACTIVITY_THRESHOLD_DAYS = 30;

function computeMenteeStatus(lastLoginAt: Date | null): MenteeStatus {
  if (!lastLoginAt) return "inactif";
  const daysSinceLogin = (Date.now() - lastLoginAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLogin <= INACTIVITY_THRESHOLD_DAYS ? "actif" : "inactif";
}

///liste des mentorés
export const getMentees = async (mentorUserId: string) => {
  const mentor = await prisma.mentor.findUnique({
    where: { userId: mentorUserId },
  });

  if (!mentor) {
    throw new Error("MENTOR_NOT_FOUND");
  }

  const mentorships = await prisma.mentorship.findMany({
    where: {
      mentorId: mentor.id,
      status: "ACCEPTED",
    },
    include: {
      entrepreneur: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              isActive: true,
              lastLoginAt: true,
            },
          },
        },
      },
      startup: {
        include: {
          steps: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return mentorships.map((m) => {
    const total = m.startup?.steps.length ?? 0;
    const completed = m.startup?.steps.filter((s) => s.completed).length ?? 0;
    const progression = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      mentorshipId: m.id,
      entrepreneur: m.entrepreneur,
      startup: m.startup
        ? { id: m.startup.id, name: m.startup.name, stage: m.startup.stage }
        : null,
      progression,
      // si le mentoré ne s'est jamais reconnecté depuis l'acceptation
      lastInteractionAt: m.entrepreneur.user.lastLoginAt ?? m.updatedAt,
      status: computeMenteeStatus(m.entrepreneur.user.lastLoginAt),
      // pas de modèle de suivi de sessions/réunions en base pour l'instant
      sessionsCount: 0,
    };
  });
};


//count demandes en attente (badge sidebar mentor)
export const getPendingRequestsCount = async (mentorUserId: string) => {
  const mentor = await prisma.mentor.findUnique({
    where: { userId: mentorUserId },
  });
  if (!mentor) throw new Error("MENTOR_NOT_FOUND");

  return prisma.mentorship.count({
    where: {
      mentorId: mentor.id,
      status: "PENDING",
    },
  });
};
