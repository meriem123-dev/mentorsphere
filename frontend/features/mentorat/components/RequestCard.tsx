"use client";

import { motion } from "framer-motion";
import { Eye, Quote, UserCheck, UserX } from "lucide-react";
import { CompatibilityRing } from "./Compatibilityring";

export type MentorshipStage = "Idée" | "MVP" | "Seed" | "Croissance";

export interface MentorshipRequestData {
  id: string;
  entrepreneurName: string;
  initials: string;
  accent?: "blue" | "rose";
  projectName: string;
  domain: string;
  stage: MentorshipStage;
  message: string;
  timeAgo: string;
  compatibilityScore?: number;
}

const STAGE_STYLES: Record<MentorshipStage, string> = {
  "Idée": "bg-info/10 text-info border-info/20",
  MVP: "bg-warning/10 text-warning border-warning/20",
  Seed: "bg-brand-rose/10 text-brand-rose border-brand-rose/20",
  Croissance: "bg-success/10 text-success border-success/20",
};

// Rotation de teintes pour badge de domaine
const DOMAIN_STYLES = [
  "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  "bg-brand-rose/10 text-brand-rose border-brand-rose/20",
  "bg-info/10 text-info border-info/20",
  "bg-success/10 text-success border-success/20",
  "bg-warning/10 text-warning border-warning/20",
];

function domainStyle(domain: string) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DOMAIN_STYLES[Math.abs(hash) % DOMAIN_STYLES.length];
}

interface RequestCardProps {
  request: MentorshipRequestData;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onViewDetails?: (id: string) => void;
}


//mon cmpst
export function RequestCard({ request, onAccept, onDecline, onViewDetails }: RequestCardProps) {
  const isRose = request.accent === "rose";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative list-none overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-gradient-brand opacity-70 transition-opacity group-hover:opacity-100"
      />

      <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
              isRose ? "bg-brand-rose" : "bg-brand-blue"
            }`}
          >
            {request.initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="font-semibold text-foreground">{request.entrepreneurName}</h3>
              <span className="text-sm text-muted-foreground">· {request.projectName}</span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${domainStyle(
                  request.domain
                )}`}
              >
                {request.domain}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STAGE_STYLES[request.stage]}`}>
                {request.stage}
              </span>
              <span className="text-xs text-muted-foreground">Il y a {request.timeAgo}</span>
            </div>

            <div className="relative mt-3 rounded-xl bg-muted/50 py-2.5 pl-8 pr-3">
              <Quote className="absolute left-2.5 top-2 h-4 w-4 text-brand-blue/30" aria-hidden />
              <p className="text-sm italic text-muted-foreground">{request.message}</p>
            </div>
          </div>
        </div>

        {typeof request.compatibilityScore === "number" && (
          <div className="flex shrink-0 flex-col items-center gap-1 self-center sm:self-start">
            <CompatibilityRing score={request.compatibilityScore} />
            <span className="text-[11px] font-medium text-muted-foreground">Affinité</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-5 py-3 pl-6">
        <button
          type="button"
          onClick={() => onAccept(request.id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] sm:flex-none"
        >
          <UserCheck className="h-4 w-4" />
          Accepter
        </button>
        <button
          type="button"
          onClick={() => onDecline(request.id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-brand-rose hover:text-brand-rose sm:flex-none"
        >
          <UserX className="h-4 w-4" />
          Refuser
        </button>
        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(request.id)}
            aria-label="Voir les détails de la demande"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.li>
  );
}