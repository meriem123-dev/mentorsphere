import prisma from "../lib/prisma";
import { getInitialsFromName } from "../utils/initials";

const STAGE_LABELS: Record<string, string> = {
  IDEE: "Idée",
  MVP: "MVP",
  SEED: "Seed Stage",
  CROISSANCE: "Croissance",
};

// Type minimal commun à Mentor et Entrepreneur
type MemberSource = {
  id: string;
  profession: string | null;
  user: { firstName: string; lastName: string; email: string };
};

//métier infos workspace et membres
export async function getWorkspaceOverview(mentorshipId: string, userId: string) {
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    include: {
      mentor: { include: { user: true } },
      entrepreneur: { include: { user: true } },
      startup: {
        include: {
          entrepreneur: { include: { user: true } },
          joinRequests: {
            where: { status: "ACCEPTED" },
            include: { requester: { include: { user: true } } },
          },
        },
      },
    },
  });

  if (!mentorship) return null;

  // seuls le mentor ou l'entrepreneur concernés peuvent voir ce workspace
  const isMentor = mentorship.mentor.userId === userId;
  const isEntrepreneur = mentorship.entrepreneur.userId === userId;
  if (!isMentor && !isEntrepreneur) return "FORBIDDEN" as const;

  const owner: MemberSource = mentorship.startup?.entrepreneur ?? mentorship.entrepreneur;
  const startupName = mentorship.startup?.name ?? `Projet de ${owner.user.firstName}`;

  const header = {
    startupName,
    startupInitials: getInitialsFromName(startupName),
    since: mentorship.createdAt,
    stage: mentorship.startup ? STAGE_LABELS[mentorship.startup.stage] : "Idée",
    domain: mentorship.startup?.domain ?? "Non défini",
  };

  const toMember = (
    entity: MemberSource,
    role: "owner" | "mentor" | "editor",
    avatarAccent: "navy" | "rose" | "blue"
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
    ...(mentorship.startup?.joinRequests.map((jr) => toMember(jr.requester, "editor", "blue")) ?? []),
  ];

  return { header, members };
}

//métier recup worspaces du user
export async function getWorkspaceSummaries(userId: string, role: "MENTOR" | "ENTREPRENEUR") {
  const mentorships = await prisma.mentorship.findMany({
    where:
      role === "MENTOR"
        ? { mentor: { userId }, status: "ACCEPTED" }
        : { entrepreneur: { userId }, status: "ACCEPTED" },
    include: {
      startup: { select: { name: true } },
      entrepreneur: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return mentorships.map((m) => {
    const startupName = m.startup?.name ?? `Projet de ${m.entrepreneur.user.firstName}`;
    return {
      id: m.id,
      startupName,
      startupInitials: getInitialsFromName(startupName),
      isActive: m.status === "ACCEPTED",
    };
  });
}