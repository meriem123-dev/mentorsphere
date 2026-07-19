import prisma from "../lib/prisma";
import { ProjectStage } from "@prisma/client";

interface CreateStartupInput {
  userId: string;
  name: string;
  description: string;
  stage: ProjectStage;
  domain: string;
  isPublic: boolean;
  isRecruiting: boolean;
  needs: string[];
  roadmapSteps: { title: string; completed: boolean }[];
}

interface UpdateStartupInput {
  userId: string;
  startupId: string;
  name?: string;
  description?: string;
  stage?: ProjectStage;
  domain?: string;
  isPublic?: boolean;
  isRecruiting?: boolean;
  needs?: string[];
  roadmapSteps?: { title: string; completed: boolean }[];
}

export class StartupService {
  //récupère l'entrepreneur lié au user, requis avant toute écriture
  static async getEntrepreneurByUserId(userId: string) {
    return prisma.entrepreneur.findUnique({
      where: { userId },
    });
  }

  //métier création
  static async createStartup(input: CreateStartupInput) {
    const entrepreneur = await this.getEntrepreneurByUserId(input.userId);
    if (!entrepreneur) {
      throw new Error("ENTREPRENEUR_NOT_FOUND");
    }

    return prisma.$transaction(
      async (tx) => {
        const startup = await tx.startup.create({
          data: {
            name: input.name,
            description: input.description,
            stage: input.stage,
            domain: input.domain,
            isPublic: input.isPublic,
            isRecruiting: input.isRecruiting,
            needs: input.needs,
            entrepreneurId: entrepreneur.id,
          },
        });

        if (input.roadmapSteps.length > 0) {
          await tx.startupStep.createMany({
            data: input.roadmapSteps.map((step, index) => ({
              startupId: startup.id,
              title: step.title,
              completed: step.completed,
              order: index,
            })),
          });
        }

        return tx.startup.findUniqueOrThrow({
          where: { id: startup.id },
          include: { steps: { orderBy: { order: "asc" } } },
        });
      },
      { timeout: 15000, maxWait: 5000 },
    );
  }

  //métier recup 1 startup
  static async getStartupById(startupId: string, requestingUserId: string) {
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        entrepreneur: true,
        steps: { orderBy: { order: "asc" } },
      },
    });

    if (!startup) return null;

    const isOwner = startup.entrepreneur.userId === requestingUserId;
    if (!startup.isPublic && !isOwner) {
      throw new Error("FORBIDDEN");
    }

    return { startup, isOwner };
  }

  static async getMyStartups(userId: string) {
    const entrepreneur = await this.getEntrepreneurByUserId(userId);
    if (!entrepreneur) {
      throw new Error("ENTREPRENEUR_NOT_FOUND");
    }

    return prisma.startup.findMany({
      where: { entrepreneurId: entrepreneur.id },
      include: { steps: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  //modif startup
  static async updateStartup(input: UpdateStartupInput) {
    const result = await this.getStartupById(input.startupId, input.userId);
    if (!result) {
      throw new Error("STARTUP_NOT_FOUND");
    }
    const { startup } = result;
    if (startup.entrepreneur.userId !== input.userId) {
      throw new Error("FORBIDDEN");
    }
    return prisma.$transaction(
      async (tx) => {
        await tx.startup.update({
          where: { id: input.startupId },
          data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.description !== undefined && {
              description: input.description,
            }),
            ...(input.stage !== undefined && { stage: input.stage }),
            ...(input.domain !== undefined && { domain: input.domain }),
            ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
            ...(input.isRecruiting !== undefined && {
              isRecruiting: input.isRecruiting,
            }),
            ...(input.needs !== undefined && { needs: input.needs }),
          },
        });

        if (input.roadmapSteps !== undefined) {
          await tx.startupStep.deleteMany({
            where: { startupId: input.startupId },
          });
          if (input.roadmapSteps.length > 0) {
            await tx.startupStep.createMany({
              data: input.roadmapSteps.map((step, index) => ({
                startupId: input.startupId,
                title: step.title,
                completed: step.completed,
                order: index,
              })),
            });
          }
        }

        return tx.startup.findUniqueOrThrow({
          where: { id: input.startupId },
          include: { steps: { orderBy: { order: "asc" } } },
        });
      },
      { timeout: 15000, maxWait: 5000 },
    );
  }

  //supp startup
  static async deleteStartup(userId: string, startupId: string) {
    const result = await this.getStartupById(startupId, userId);
    if (!result) {
      throw new Error("STARTUP_NOT_FOUND");
    }
    const { startup } = result;
    if (startup.entrepreneur.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    await prisma.startup.delete({ where: { id: startupId } });
  }

  //métier recup public projetss
  static async getPublicStartups(userId: string) {
    const entrepreneur = await this.getEntrepreneurByUserId(userId);

    const startups = await prisma.startup.findMany({
      where: {
        isPublic: true,
        ...(entrepreneur && { entrepreneurId: { not: entrepreneur.id } }),
      },
      include: {
        steps: { orderBy: { order: "asc" } },
        joinRequests: entrepreneur
          ? {
              where: { requesterId: entrepreneur.id },
              select: { status: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    return startups.map(({ joinRequests, ...startup }) => ({
      ...startup,
      joinRequestStatus: joinRequests?.[0]?.status ?? null,
    }));
  }

  //créer une demande pour rejoindre un projet public
  static async createJoinRequest(input: {
    startupId: string;
    userId: string;
    message?: string;
  }) {
    const entrepreneur = await this.getEntrepreneurByUserId(input.userId);
    if (!entrepreneur) {
      throw new Error("ENTREPRENEUR_NOT_FOUND");
    }

    const startup = await prisma.startup.findUnique({
      where: { id: input.startupId },
    });
    if (!startup) {
      throw new Error("STARTUP_NOT_FOUND");
    }
    if (!startup.isPublic) {
      throw new Error("FORBIDDEN");
    }
    if (startup.entrepreneurId === entrepreneur.id) {
      throw new Error("CANNOT_JOIN_OWN_STARTUP");
    }

    try {
      return await prisma.projectJoinRequest.create({
        data: {
          startupId: input.startupId,
          requesterId: entrepreneur.id,
          message: input.message?.trim() || null,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("ALREADY_REQUESTED");
      }
      throw error;
    }
  }

  //récupère les demandes reçues sur les startups du user connecté
static async getReceivedJoinRequests(userId: string, status?: string) {
  const entrepreneur = await this.getEntrepreneurByUserId(userId);
  if (!entrepreneur) {
    throw new Error("ENTREPRENEUR_NOT_FOUND");
  }

  return prisma.projectJoinRequest.findMany({
    where: {
      startup: { entrepreneurId: entrepreneur.id },
      ...(status ? { status: status as any } : {}),
    },
    include: {
      startup: { select: { id: true, name: true } },
      requester: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

//accepter ou refuser une demande (avec motif si refus)
static async respondToJoinRequest(input: {
  userId: string;
  requestId: string;
  accept: boolean;
  rejectionReason?: string;
}) {
  const entrepreneur = await this.getEntrepreneurByUserId(input.userId);
  if (!entrepreneur) {
    throw new Error("ENTREPRENEUR_NOT_FOUND");
  }

  const request = await prisma.projectJoinRequest.findUnique({
    where: { id: input.requestId },
    include: { startup: true },
  });
  if (!request) {
    throw new Error("REQUEST_NOT_FOUND");
  }
  if (request.startup.entrepreneurId !== entrepreneur.id) {
    throw new Error("FORBIDDEN");
  }
  if (request.status !== "PENDING") {
    throw new Error("REQUEST_ALREADY_HANDLED");
  }
  if (!input.accept && !input.rejectionReason?.trim()) {
    throw new Error("REJECTION_REASON_REQUIRED");
  }

  return prisma.projectJoinRequest.update({
    where: { id: input.requestId },
    data: {
      status: input.accept ? "ACCEPTED" : "REJECTED",
      ...(!input.accept && {
        rejectionReason: input.rejectionReason!.trim(),
      }),
    },
    include: {
      startup: { select: { id: true, name: true } },
    },
  });
}

}
