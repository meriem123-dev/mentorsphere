"use client";

import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

/** Affiche un toast de confirmation moderne **/
export function confirmToast({
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const id = toast.custom(
      (t) => (
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-8 pr-12 shadow-lg">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                variant === "danger"
                  ? "bg-danger/10 text-danger"
                  : "bg-brand-blue/10 text-brand-blue"
              }`}
            >
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col gap-0.5 pt-0.5">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t);
                resolve(false);
              }}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t);
                resolve(true);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium text-white transition-transform active:scale-[0.98] ${
                variant === "default" ? "bg-rose" : "bg-brand-rose"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  });
}