"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { DocumentListItem } from "./DocumentListItem";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";
import type { WorkspaceDocument } from "@/types/workspaceTypes";

type Props = {
  mentorshipId: string;
  documents: WorkspaceDocument[];
  onDocumentsChange: (documents: WorkspaceDocument[]) => void;
  onDownload: (documentId: string) => void;
};

export function DocumentsTab({
  mentorshipId,
  documents,
  onDocumentsChange,
  onDownload,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const created = await workspaceApi.uploadDocument(mentorshipId, file);
      onDocumentsChange([created, ...documents]);
      toast.success("Document ajouté");
    } catch {
      toast.error("Impossible d'uploader le document");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  //appel API supp
const handleDeleteDocument = async (documentId: string) => {
  try {
    await workspaceApi.deleteDocument(mentorshipId, documentId);
    onDocumentsChange(documents.filter((d) => d.id !== documentId));
    toast.success("Document supprimé");
  } catch (err) {
    toast.error("Impossible de supprimer le document");
  }
};

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {documents.length} documents
        </h3>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-hero px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
        >
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? "Envoi..." : "Ajouter un document"}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentListItem
            key={doc.id}
            name={doc.name}
            fileType={doc.fileType}
            sizeLabel={doc.sizeLabel}
            uploadedAt={doc.uploadedAt}
            sessionNumber={doc.sessionNumber}
            onDownload={() => onDownload(doc.id)}
            onDelete={()=>handleDeleteDocument(doc.id)}
          />
        ))}
      </div>
    </div>
  );
}
