"use client";

import { useState } from "react";
import { toast } from "sonner";
import { workspaceApi } from "../../workspace/api/workspaceAPI";
import { SessionStatusBadge } from "../../workspace/components/SessionStatusBadge";

type Status = "SCHEDULED" | "COMPLETED" | "CANCELLED";

type Props = {
  mentorshipId: string;
  sessionId: string;
  currentStatus: Status;
  canEdit: boolean; // true si isMentor
  onChanged?: (status: Status) => void;
};

export function SessionStatusControl({
  mentorshipId,
  sessionId,
  currentStatus,
  canEdit,
  onChanged,
}: Props) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(next: Status) {
    if (next === status) return;
    setLoading(true);
    try {
      await workspaceApi.updateSessionStatus(mentorshipId, sessionId, next);
      setStatus(next);
      onChanged?.(next);
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Impossible de mettre à jour le statut");
    } finally {
      setLoading(false);
    }
  }

  if (!canEdit) {
    return <SessionStatusBadge status={status} />;
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as Status)}
      className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none"
    >
      <option value="SCHEDULED">À venir</option>
      <option value="COMPLETED">Terminée</option>
      <option value="CANCELLED">Annulée</option>
    </select>
  );
}