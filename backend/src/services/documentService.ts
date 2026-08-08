import prisma from "../lib/prisma";
import { uploadToCloudinary } from "../utils/cloudinary"; // adapte le chemin
import { getWorkspaceAccess } from "./workspaceService";
import { resolveDocumentType, formatFileSize } from "../utils/fileHelpers";


//métier recup docs
export async function listWorkspaceDocuments(mentorshipId: string, userId: string) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  const docs = await prisma.workspaceDocument.findMany({
    where: { mentorshipId },
    orderBy: { createdAt: "desc" },
  });

  return docs.map((d) => ({
    id: d.id,
    name: d.name,
    fileType: d.fileType.toLowerCase(),
    sizeLabel: formatFileSize(d.sizeBytes),
    uploadedAt: d.createdAt,
    sessionNumber: d.sessionNumber ?? undefined,
    downloadUrl: d.fileUrl,
  }));
}


//métier upload doc
export async function uploadWorkspaceDocument(
  mentorshipId: string,
  userId: string,
  file: Express.Multer.File,
  sessionNumber?: number,
) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  const fileUrl = await uploadToCloudinary(file, "workspace-documents");

  const created = await prisma.workspaceDocument.create({
    data: {
      name: file.originalname,
      fileType: resolveDocumentType(file.mimetype),
      fileUrl,
      sizeBytes: file.size,
      sessionNumber: sessionNumber ?? null,
      mentorshipId,
      uploadedById: userId,
    },
  });

  return {
    id: created.id,
    name: created.name,
    fileType: created.fileType.toLowerCase(),
    sizeLabel: formatFileSize(created.sizeBytes),
    uploadedAt: created.createdAt,
    sessionNumber: created.sessionNumber ?? undefined,
    downloadUrl: created.fileUrl,
  };
}

//métier supp un doc
export async function deleteWorkspaceDocument(
  mentorshipId: string,
  documentId: string,
  userId: string,
) {
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return null;
  if (access === "FORBIDDEN") return "FORBIDDEN" as const;

  const doc = await prisma.workspaceDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.mentorshipId !== mentorshipId) return null;

  await prisma.workspaceDocument.delete({ where: { id: documentId } });
  return true;
}