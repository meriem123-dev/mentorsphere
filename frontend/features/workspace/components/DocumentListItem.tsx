import { Download, Trash2 } from "lucide-react";
import { DocumentFileIcon } from "./DocumentFileIcon";
import type { DocumentFileType } from "../../../types/workspaceTypes";

type Props = {
  name: string;
  fileType: DocumentFileType;
  sizeLabel: string;
  uploadedAt: string;
  sessionNumber?: number;
  onDownload: () => void;
  onMenuClick?: () => void;
  onDelete?: () => void;
};




export function DocumentListItem({
  name,
  fileType,
  sizeLabel,
  uploadedAt,
  sessionNumber,
  onDownload,
  onMenuClick,
  onDelete,
}: Props) {
  const dateLabel = new Date(uploadedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between rounded-xl bg-card p-4">
      <div className="flex items-center gap-3">
        <DocumentFileIcon fileType={fileType} />
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
             {sizeLabel} · {dateLabel}
            {sessionNumber !== undefined && (
              <>
                {" · "}
                <span className="text-brand-rose">Session #{sessionNumber}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onDownload}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <Trash2 className="h-4 w-4 text-brand-rose" onClick={onDelete}/>
        </button>
      </div>
    </div>
  );
}