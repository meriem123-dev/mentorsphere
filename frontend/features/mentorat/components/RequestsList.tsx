"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RequestCard, type MentorshipRequestData } from "./RequestCard";

interface RequestsListProps {
  requests: MentorshipRequestData[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onViewDetails?: (id: string) => void;
}


//cmpst
export function RequestsList({ requests, onAccept, onDecline, onViewDetails }: RequestsListProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {requests.length > 0 ? (
        <motion.ul layout className="flex flex-col gap-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={onAccept}
              onDecline={onDecline}
              onViewDetails={onViewDetails}
            />
          ))}
        </motion.ul>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground"
        >
          Vous êtes à jour — aucune demande à traiter pour le moment.
        </motion.div>
      )}
    </AnimatePresence>
  );
}