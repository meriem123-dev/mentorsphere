"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
interface RejectReasonModalProps {
  open: boolean;
  requesterName: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void> | void;
}

const MAX_REASON = 300;

//cmpst
export function RejectReasonModal({
  open,
  requesterName,
  onClose,
  onSubmit,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const trimmed = reason.trim();
  const isValid = trimmed.length >= 10;

  const handleClose = () => {
    setReason("");
    setTouched(false);
    onClose();
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setReason("");
      setTouched(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Refuser la demande de {requesterName}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="rejectReason"
                    className="text-sm font-medium text-foreground"
                  >
                    Motif du refus
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {reason.length}/{MAX_REASON}
                  </span>
                </div>
                <textarea
                  id="rejectReason"
                  rows={4}
                  maxLength={MAX_REASON}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Ex: Le profil ne correspond pas au besoin technique recherché actuellement..."
                  className={`resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors ${
                    touched && !isValid
                      ? "border-danger focus:border-danger"
                      : "border-border focus:border-brand-rose"
                  }`}
                />
                {touched && !isValid && (
                  <p className="text-xs text-danger">
                    Le motif doit contenir au moins 10 caractères — il sera
                    envoyé à {requesterName}.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Annuler
              </button>
              <Button
                type="button"
                variant={"default"}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                Confirmer le refus
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
