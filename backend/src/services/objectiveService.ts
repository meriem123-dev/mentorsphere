import prisma from "../lib/prisma";
import { getWorkspaceAccess } from "./workspaceService";

//métier recup objectifs 
export async function listObjectives(mentorshipId: string, userId: string) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  return prisma.objective.findMany({
    where: { mentorshipId },
    orderBy: { createdAt: "asc" },
  });
}

//métier créer objectif
export async function createObjective(
  mentorshipId: string,
  userId: string,
  data: { title: string; category: string; progress?: number },
) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  return prisma.objective.create({
    data: {
      mentorshipId,
      title: data.title,
      category: data.category,
      progress: data.progress ?? 0,
    },
  });
}

//métier mettre à jour objectif
export async function updateObjective(
  mentorshipId: string,
  objectiveId: string,
  userId: string,
  data: { title?: string; category?: string; progress?: number },
) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  const objective = await prisma.objective.findUnique({ where: { id: objectiveId } });
  if (!objective || objective.mentorshipId !== mentorshipId) return null;

  return prisma.objective.update({ where: { id: objectiveId }, data });
}

//métier supp objectif
export async function deleteObjective(
  mentorshipId: string,
  objectiveId: string,
  userId: string,
) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  const objective = await prisma.objective.findUnique({ where: { id: objectiveId } });
  if (!objective || objective.mentorshipId !== mentorshipId) return null;

  await prisma.objective.delete({ where: { id: objectiveId } });
  return true;
}