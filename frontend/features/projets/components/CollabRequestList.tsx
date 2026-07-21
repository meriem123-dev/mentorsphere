"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Users2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CollabRequestCard } from "./CollabRequestCard";
import type { CollabRequest } from "@/types/startupTypes";

interface CollabRequestsListProps {
  requests: CollabRequest[];
  onAccept: (id: string) => Promise<void> | void;
  onReject: (id: string, reason: string) => Promise<void> | void;
}

export function CollabRequestsList({
  requests,
  onAccept,
  onReject,
}: CollabRequestsListProps) {
  const router = useRouter();
  const pending = requests.filter((r) => r.status === "PENDING");

  if (pending.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-white">
          <Users2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            Aucune demande en attente
          </p>
          <p className="text-sm text-muted-foreground">
            Les demandes pour rejoindre vos projets apparaîtront ici.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false} mode="popLayout">
        {pending.map((request) => (
          <CollabRequestCard
            key={request.id}
            request={request}
            onAccept={onAccept}
            onReject={onReject}
            onViewProfile={(entrepreneurId) => router.push(`/profil/entrepreneur/${entrepreneurId}`)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}