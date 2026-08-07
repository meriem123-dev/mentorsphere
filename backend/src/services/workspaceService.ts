import prisma from "../lib/prisma";
import { getInitialsFromName } from "../utils/initials";

const STAGE_LABELS: Record<string, string> = {
  IDEE: "Idée",
  MVP: "MVP",
  SEED: "Seed Stage",
  CROISSANCE: "Croissance",
};

type MemberSource = {
  id: string;
  profession: string | null;
  user: { firstName: string; lastName: string; email: string };
};

//fct réutilisable pour vérifier access
export async function getWorkspaceAccess(mentorshipId: string, userId: string) {
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    include: {
      mentor: { include: { user: true } },
      entrepreneur: { include: { user: true } },
      startup: {
        include: {
          entrepreneur: { include: { user: true } },
          steps: true,
          joinRequests: {
            where: { status: "ACCEPTED" },
            include: { requester: { include: { user: true } } },
          },
        },
      },
    },
  });

  if (!mentorship) return null;

  const isMentor = mentorship.mentor.userId === userId;
  const isOwner = mentorship.entrepreneur.userId === userId;
  const isCollaborator =
    mentorship.startup?.joinRequests.some(
      (jr) => jr.requester.userId === userId,
    ) ?? false;

  if (!isMentor && !isOwner && !isCollaborator) return "FORBIDDEN" as const;

  return { mentorship, isMentor, isOwner, isCollaborator };
}

//métier infos workspace et membres
export async function getWorkspaceOverview(mentorshipId: string, userId: string) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  const { mentorship } = access;

  const owner: MemberSource =
    mentorship.startup?.entrepreneur ?? mentorship.entrepreneur;
  const startupName =
    mentorship.startup?.name ?? `Projet de ${owner.user.firstName}`;

  const steps = mentorship.startup?.steps ?? [];
  const progress =
    steps.length > 0
      ? Math.round((steps.filter((s) => s.completed).length / steps.length) * 100)
      : 0;

  const header = {
    startupName,
    startupInitials: getInitialsFromName(startupName),
    since: mentorship.createdAt,
    stage: mentorship.startup ? STAGE_LABELS[mentorship.startup.stage] : "Idée",
    domain: mentorship.startup?.domain ?? "Non défini",
    progress,
  };

  const toMember = (
    entity: MemberSource,
    role: "owner" | "mentor" | "collaborator",
    avatarAccent: "navy" | "rose" | "blue",
  ) => ({
    id: entity.id,
    name: `${entity.user.firstName} ${entity.user.lastName}`,
    initials: getInitialsFromName(`${entity.user.firstName} ${entity.user.lastName}`),
    role,
    title:
      entity.profession ??
      (role === "owner" ? "Fondateur" : role === "mentor" ? "Mentor" : "Collaborateur"),
    email: entity.user.email,
    avatarAccent,
  });

  const members = [
    toMember(owner, "owner", "navy"),
    toMember(mentorship.mentor, "mentor", "rose"),
    ...(mentorship.startup?.joinRequests.map((jr) =>
      toMember(jr.requester, "collaborator", "blue"),
    ) ?? []),
  ];

  return { header, members };
}

//métier recup worspaces du user
export async function getWorkspaceSummaries(
  userId: string,
  role: "MENTOR" | "ENTREPRENEUR",
) {
  const mentorships = await prisma.mentorship.findMany({
    where:
      role === "MENTOR"
        ? { mentor: { userId }, status: "ACCEPTED" }
        : {
            status: "ACCEPTED",
            OR: [
              { entrepreneur: { userId } },
              {
                startup: {
                  joinRequests: {
                    some: { status: "ACCEPTED", requester: { userId } },
                  },
                },
              },
            ],
          },
    include: {
      startup: { select: { name: true } },
      entrepreneur: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return mentorships.map((m) => {
    const startupName =
      m.startup?.name ?? `Projet de ${m.entrepreneur.user.firstName}`;
    return {
      id: m.id,
      startupName,
      startupInitials: getInitialsFromName(startupName),
      isActive: m.status === "ACCEPTED",
    };
  });
}

//métier recup messages du workspace
export async function getWorkspaceMessages(mentorshipId: string, userId: string) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  const messages = await prisma.message.findMany({
    where: { mentorshipId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { firstName: true, lastName: true } } },
  });

  return messages.map((m) => ({
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    senderInitials: `${m.sender.firstName[0]}${m.sender.lastName[0]}`,
    createdAt: m.createdAt,
  }));
}