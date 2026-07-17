"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Send } from "lucide-react";

interface JoinRequestModalProps {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void> | void;
}

const MAX_MESSAGE = 500;


//cmpst
export function JoinRequestModal({
  open,
  projectName,
  onClose,
  onSubmit,
}: JoinRequestModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(message.trim());
      setMessage("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                Rejoindre {projectName}
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
                  <label htmlFor="joinMessage" className="text-sm font-medium text-foreground">
                    Message au fondateur (optionnel)
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {message.length}/{MAX_MESSAGE}
                  </span>
                </div>
                <textarea
                  id="joinMessage"
                  rows={4}
                  maxLength={MAX_MESSAGE}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Présentez-vous et expliquez pourquoi vous souhaitez rejoindre ce projet..."
                  className="resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-rose"
                />
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
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Envoyer la demande
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}