import { WorkspaceDocumentType } from "@prisma/client";

export function resolveDocumentType(mimetype: string): WorkspaceDocumentType {
  if (mimetype === "application/pdf") return "PDF";
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel")) return "EXCEL";
  if (mimetype.includes("word") || mimetype.includes("document")) return "WORD";
  if (mimetype.startsWith("image/")) return "IMAGE";
  return "OTHER";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}