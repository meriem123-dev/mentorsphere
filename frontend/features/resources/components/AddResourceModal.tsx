"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { X } from "lucide-react";
import type { ResourceType } from "../../../types/resourceTypes";

interface AddResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    type: ResourceType;
    title: string;
    url: string;
    file?: File;
  }) => Promise<void> | void;
}

const TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: "document", label: "Document" },
  { value: "video", label: "Vidéo" },
  { value: "link", label: "Lien" },
];


//modale
export function AddResourceModal({ open, onOpenChange, onSubmit }: AddResourceModalProps) {
  const [type, setType] = useState<ResourceType>("document");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    title.trim() !== "" &&
    (type === "document" ? file !== undefined : url.trim() !== "");

  function resetForm() {
    setType("document");
    setTitle("");
    setUrl("");
    setFile(undefined);
  }

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({ type, title, url, ...(file && { file }) });
      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Ajouter une ressource
            </Dialog.Title>
            <Dialog.Close
              render={
                <button aria-label="Fermer" className="text-muted-foreground hover:text-foreground" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </button>
              }
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <RadioGroup
                value={type}
                onValueChange={(v) => {
                  setType(v as ResourceType);
                  setUrl("");
                  setFile(undefined);
                }}
              >
                <div className="flex items-center gap-4">
                  {TYPE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-foreground">
                      <Radio.Root
                        value={option.value}
                        className="flex h-4 w-4 items-center justify-center rounded-full border border-border data-[checked]:border-brand-rose"
                      >
                        <Radio.Indicator className="h-2 w-2 rounded-full bg-brand-rose" />
                      </Radio.Root>
                      {option.label}
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="resource-title" className="text-sm font-medium text-foreground">
                Titre
              </label>
              <input
                id="resource-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nom de la ressource"
                className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            {type === "document" && (
              <div className="flex flex-col gap-2">
                <label htmlFor="resource-file" className="text-sm font-medium text-foreground">
                  Fichier
                </label>
                <input
                  id="resource-file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-rose file:px-3 file:py-1.5 file:text-white"
                />
              </div>
            )}

            {(type === "video" || type === "link") && (
              <div className="flex flex-col gap-2">
                <label htmlFor="resource-url" className="text-sm font-medium text-foreground">
                  URL
                </label>
                <input
                  id="resource-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="flex-1 rounded-lg bg-brand-rose py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}