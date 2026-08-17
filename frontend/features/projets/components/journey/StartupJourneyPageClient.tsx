"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { startupApi } from "@/features/projets/api/startuAPI";
import type { Startup } from "@/types/startupTypes";
import { StartupJourneyHeader } from "./StartupJourneyHeader";
import { StepTimeline } from "./StepTimeLine";

export function StartupJourneyPageClient({ startupId }: { startupId: string }) {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingIndex, setTogglingIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await startupApi.getById(startupId);
        if (!cancelled) {
          setStartup(res.data.startup);
          setIsOwner(res.data.isOwner);
        }
      } catch (error) {
        if (!cancelled) toast.error("Impossible de charger le parcours de la startup.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [startupId]);

  const handleToggle = async (index: number) => {
    if (!startup) return;

    const previousSteps = startup.steps;
    const nextSteps = startup.steps.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s));

    setStartup({ ...startup, steps: nextSteps });
    setTogglingIndex(index);

    try {
      const res = await startupApi.update(startup.id, {
        roadmapSteps: nextSteps.map(({ title, completed }) => ({ title, completed })),
      });
      setStartup(res.data.startup);
    } catch (error) {
      setStartup({ ...startup, steps: previousSteps });
      toast.error("Impossible de mettre à jour le parcours de la startup.");
    } finally {
      setTogglingIndex(null);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Chargement du parcours...</div>;
  }

  if (!startup) {
    return <div className="p-6 text-sm text-muted-foreground">Startup introuvable.</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 sm:gap-4">
      <StartupJourneyHeader startup={startup} />
      <StepTimeline
        steps={startup.steps}
        isOwner={isOwner}
        togglingIndex={togglingIndex}
        onToggle={handleToggle}
      />
    </div>
  );
}