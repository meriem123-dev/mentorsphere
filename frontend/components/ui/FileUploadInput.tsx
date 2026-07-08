"use client";

import { useRef } from "react";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadInputProps {
  label: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
}

export function FileUploadInput({ label, multiple = false, files, onChange }: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onChange(multiple ? [...files, ...selected] : selected);
    e.target.value = ""; // permet de re-sélectionner le même fichier
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-input bg-card text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
      >
        <Upload size={16} />
        {label}
      </button>
      <input ref={inputRef} type="file" multiple={multiple} onChange={handleFileSelect} className="hidden" />

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/40 text-sm">
              <span className="flex items-center gap-2 truncate">
                <FileText size={14} className="text-primary flex-shrink-0" />
                <span className="truncate text-foreground">{file.name}</span>
              </span>
              <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}