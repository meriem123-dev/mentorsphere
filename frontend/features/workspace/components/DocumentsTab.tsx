import { Upload } from "lucide-react";
import { DocumentListItem } from "./DocumentListItem";
import type { WorkspaceDocument } from "../../../types/workspaceTypes";

type Props = {
  documents: WorkspaceDocument[];
  onDownload: (documentId: string) => void;
  onUpload: () => void;
};

export function DocumentsTab({ documents, onDownload, onUpload }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {documents.length} documents
        </h3>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-hero px-3 py-2 text-xs font-medium text-white"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
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
          />
        ))}
      </div>
    </div>
  );
}