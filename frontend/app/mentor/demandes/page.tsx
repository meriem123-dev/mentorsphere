// frontend/app/mentor/mentorship-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RequestsList } from "@/features/mentorat/components/RequestsList";
import type { MentorshipRequestData, MentorshipStage } from "@/features/mentorat/components/RequestCard";
import { mentorshipApi } from "@/features/mentorat/api/mentorshipAPI";
import type { Mentorship } from "@/types/mentoratTypes";
import { timeAgo } from "@/lib/timeAgo";
import { confirmToast } from "@/lib/confirm";

const STAGE_LABELS: Record<string, MentorshipStage> = {
  IDEE: "Idée",
  MVP: "MVP",
  SEED: "Seed",
  CROISSANCE: "Croissance",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// mapping Mentorship (API) -> carte affichée
function mapMentorshipToRequestData(m: Mentorship): MentorshipRequestData | null {
  // une demande sans entrepreneur ou startup rattachée n'est pas affichable proprement
  if (!m.entrepreneur || !m.startup) return null;

  const { user } = m.entrepreneur;

  return {
    id: m.id,
    entrepreneurId: m.entrepreneur.id,
    entrepreneurName: `${user.firstName} ${user.lastName}`,
    initials: getInitials(user.firstName, user.lastName),
    accent: "blue",
    projectName: m.startup.name,
    domain: m.startup.domain,
    stage: STAGE_LABELS[m.startup.stage] ?? "Idée",
    message: m.message ?? "",
    timeAgo: timeAgo(m.createdAt),
  };
}

export default function MentorshipRequestsPage() {
  const [requests, setRequests] = useState<MentorshipRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  

  useEffect(() => {
  let cancelled = false;

  const load = async () => {
    try {
      const res = await mentorshipApi.getReceived("PENDING");
      const mapped = res.requests
        .map(mapMentorshipToRequestData)
        .filter((r): r is MentorshipRequestData => r !== null);

      if (!cancelled) setRequests(mapped);
    } catch {
      if (!cancelled) toast.error("Impossible de charger les demandes.");
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  };

  load();

  return () => {
    cancelled = true;
  };
}, []);

  const handleAccept = async (id: string) => {
    const previous = requests;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await mentorshipApi.respond(id, true);
      toast.success("Demande acceptée.");
    } catch {
      setRequests(previous);
      toast.error("Erreur lors de l'acceptation de la demande.");
    }
  };

  const handleDecline = async (id: string) => {
    const confirmed = await confirmToast({
      title: "Refuser cette demande ?",
      description: "L'entrepreneur sera notifié du refus.",
      confirmLabel: "Refuser",
    });
    if (!confirmed) return;

    const previous = requests;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await mentorshipApi.respond(id, false);
      toast.success("Demande refusée.");
    } catch {
      setRequests(previous);
      toast.error("Erreur lors du refus de la demande.");
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Demandes de mentorat</h1>
          <p className="text-sm text-muted-foreground">
            {requests.length > 0
              ? `${requests.length} en attente de votre réponse`
              : "Aucune demande en attente"}
          </p>
        </div>
        {requests.length > 0 && (
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-rose px-2 text-xs font-semibold text-white">
            {requests.length}
          </span>
        )}
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <RequestsList requests={requests} onAccept={handleAccept} onDecline={handleDecline} />
      )}
    </div>
  );
}