import { FileText, FileSpreadsheet, FileImage, File } from "lucide-react";
import type { DocumentFileType } from "../../../types/workspaceTypes";

const ICON_STYLES: Record<DocumentFileType, { icon: typeof FileText; className: string }> = {
  pdf: { icon: FileText, className: "bg-brand-rose/10 text-brand-rose" },
  excel: { icon: FileSpreadsheet, className: "bg-emerald-500/10 text-emerald-600" },
  word: { icon: FileText, className: "bg-brand-blue/10 text-brand-blue" },
  image: { icon: FileImage, className: "bg-brand-blue/10 text-brand-blue" },
  other: { icon: File, className: "bg-muted text-muted-foreground" },
};

export function DocumentFileIcon({ fileType }: { fileType: DocumentFileType }) {
  const { icon: Icon, className } = ICON_STYLES[fileType];
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}