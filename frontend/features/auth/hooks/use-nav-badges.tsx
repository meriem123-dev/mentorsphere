"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { mentorshipApi } from "@/features/mentorat/api/mentorshipAPI";

interface NavBadgeCounts {
  notifications: number;
  mentorRequests: number;
}

export function useNavBadges(): NavBadgeCounts {
  const { user } = useAuth();
  const [counts, setCounts] = useState<NavBadgeCounts>({
    notifications: 0,
    mentorRequests: 0,
  });

  useEffect(() => {
    if (user?.role !== "MENTOR") return;

    mentorshipApi
      .getPendingCount()
      .then((data) =>
        setCounts((prev) => ({ ...prev, mentorRequests: data.count })),
      )
      .catch(() => {});
    // TODO: notifications — pas de modèle Notification en base pour l'instant
  }, [user?.role]);

  return counts;
}