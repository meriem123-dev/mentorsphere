"use client";

import { useEffect, useState } from "react";

type WarmupStatus = "checking" | "ready" | "slow" | "error";

export function useBackendWarmup() {
  const [status, setStatus] = useState<WarmupStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === "checking" ? "slow" : s));
    }, 2000); // si pas de réponse après 2s > Render "dort"

    async function ping() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
          method: "GET",
        });
        if (!cancelled) setStatus(res.ok ? "ready" : "error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    ping();
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  return status;
}