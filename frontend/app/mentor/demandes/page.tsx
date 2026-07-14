"use client";

import { useState } from "react";
import { RequestsList } from "@/features/mentorat/components/RequestsList";
import type { MentorshipRequestData } from "@/features/mentorat/components/RequestCard";

const MOCK_REQUESTS: MentorshipRequestData[] = [
  {
    id: "1",
    entrepreneurName: "Amara Diop",
    initials: "AD",
    accent: "blue",
    projectName: "AgriTech Mali",
    domain: "AgriTech",
    stage: "Idée",
    message: "Je cherche un mentor pour m'aider à valider mon idée dans le secteur agricole sénégalais.",
    timeAgo: "2h",
    compatibilityScore: 87,
  },
  {
    id: "2",
    entrepreneurName: "Yuki Tanaka",
    initials: "YT",
    accent: "rose",
    projectName: "LearnFlow",
    domain: "EdTech",
    stage: "MVP",
    message: "MVP lancé avec 200 early adopters. J'ai besoin d'aide pour la stratégie de croissance.",
    timeAgo: "5h",
    compatibilityScore: 72,
  },
  {
    id: "3",
    entrepreneurName: "Marco Silva",
    initials: "MS",
    accent: "rose",
    projectName: "CryptoVault",
    domain: "FinTech",
    stage: "Seed",
    message: "Cherche un mentor avec expérience en levée de fonds pour notre série A.",
    timeAgo: "1j",
    compatibilityScore: 64,
  },
];

export default function MentorshipRequestsPage() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const handleAccept = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
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

      <RequestsList requests={requests} onAccept={handleAccept} onDecline={handleDecline} />
    </div>
  );
}