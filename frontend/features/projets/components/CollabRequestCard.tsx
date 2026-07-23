"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2, Clock, Tag, MessageSquare, ExternalLink } from "lucide-react";
import { RejectReasonModal } from "./RejectReasonModal";
import type { CollabRequest } from "@/types/startupTypes";

interface CollabRequestCardProps {
  request: CollabRequest;
  onAccept: (id: string) => Promise<void> | void;
  onReject: (id: string, reason: string) => Promise<void> | void;
  onViewProfile?: (entrepreneurId: string) => void;
}

export function CollabRequestCard({
  request,
  onAccept,
  onReject,
  onViewProfile,
}: CollabRequestCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const isBusy = isAccepting || isRejecting;

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(request.id);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async (reason: string) => {
    setIsRejecting(true);
    try {
      await onReject(request.id, reason);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="rounded-2xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {request.requester.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={request.requester.avatarUrl}
                alt={request.requester.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold text-white ring-2 ring-border">
                {request.requester.initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground">
                  {request.requester.name}
                </h3>
                {onViewProfile && (
                  <button
                    type="button"
                    onClick={() => onViewProfile(request.requester.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                  >
                   <span className="hidden sm:inline">Voir profil</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                souhaite rejoindre{" "}
                <span className="font-medium text-foreground">
                  {request.projectName}
                </span>
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden />
            {request.createdAt}
          </span>
        </div>

        {request.need && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
            <Tag className="h-3 w-3" aria-hidden />
            Répond au besoin : {request.need}
          </div>
        )}

        {request.message && (
          <div className="mt-3 flex gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5">
            <MessageSquare
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <p className="min-w-0 text-sm text-foreground/90 wrap-break-word">{request.message}</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setRejectModalOpen(true)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
          >
            {isRejecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Refuser
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {isAccepting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Accepter
          </button>
        </div>
      </motion.div>

      <RejectReasonModal
        open={rejectModalOpen}
        requesterName={request.requester.name}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleReject}
      />
    </>
  );
}