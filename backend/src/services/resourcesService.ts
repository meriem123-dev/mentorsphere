import { PrismaClient, ResourceType, Prisma } from "@prisma/client";
import { uploadToCloudinary } from "../utils/cloudinary";



const prisma = new PrismaClient();


//métier ajout ressource
export async function createResource(params: {
  type: ResourceType;
  title: string;
  authorId: string;
  url?: string;
  durationLabel?: string;
 file?: Express.Multer.File;
}) {
  const { type, title, authorId, url, durationLabel, file } = params;

  let fileUrl: string | undefined;
  let fileName: string | undefined;
  let sizeBytes: number | undefined;

  if (file) {
  fileUrl = await uploadToCloudinary(file, "resources");
  fileName = file.originalname;
  sizeBytes = file.size;
}

  return prisma.resource.create({
    data: {
      type,
      title,
      authorId,
      ...(url !== undefined && { url }),
      ...(durationLabel !== undefined && { durationLabel }),
      ...(fileUrl !== undefined && { fileUrl }),
      ...(fileName !== undefined && { fileName }),
      ...(sizeBytes !== undefined && { sizeBytes }),
    },
    include: { author: true },
  });
}

//métier recup ressources
export async function listResources(params: {
  userId: string;
  type?: ResourceType;
  search?: string;
  savedOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  const { userId, type, search, savedOnly, page = 1, limit = 20 } = params;

  const where: Prisma.ResourceWhereInput = {
    ...(type !== undefined && { type }),
    ...(search !== undefined && search !== "" && {
      title: { contains: search, mode: "insensitive" },
    }),
    ...(savedOnly && { saves: { some: { userId } } }),
  };

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      include: {
        author: true,
        saves: { where: { userId }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.resource.count({ where }),
  ]);

  return {
    resources: resources.map(({ saves, ...r }) => ({ ...r, isSaved: saves.length > 0 })),
    total,
    page,
    limit,
  };
}

//métier recup une ressource
export async function getResourceById(id: string, userId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      author: true,
      saves: { where: { userId }, select: { id: true } },
    },
  });
  if (!resource) return null;

  const { saves, ...rest } = resource;
  return { ...rest, isSaved: saves.length > 0 };
}

//métier supp ressource
export async function deleteResource(id: string, userId: string) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return "NOT_FOUND" as const;
  if (resource.authorId !== userId) return "FORBIDDEN" as const;

  await prisma.resource.delete({ where: { id } });
  return "OK" as const;
}

//métier save une ressource
export async function toggleSaveResource(id: string, userId: string) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return "NOT_FOUND" as const;

  const existing = await prisma.resourceSave.findUnique({
    where: { resourceId_userId: { resourceId: id, userId } },
  });

  if (existing) {
    await prisma.resourceSave.delete({ where: { id: existing.id } });
    return { isSaved: false };
  }

  await prisma.resourceSave.create({ data: { resourceId: id, userId } });
  return { isSaved: true };
}