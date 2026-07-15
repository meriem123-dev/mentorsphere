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
  static async getStartupById(startupId: string) {
    return prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        entrepreneur: true,
        steps: { orderBy: { order: "asc" } },
      },
    });
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
    const startup = await this.getStartupById(input.startupId);
    if (!startup) {
      throw new Error("STARTUP_NOT_FOUND");
    }
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
    const startup = await this.getStartupById(startupId);
    if (!startup) {
      throw new Error("STARTUP_NOT_FOUND");
    }
    if (startup.entrepreneur.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    await prisma.startup.delete({ where: { id: startupId } });
  }
}
