"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AITabsNav } from "@/features/ai/components/AITabsNav";
import { ResumeIATab } from "@/features/ai/components/resume/ResumeIATab";
import { RecommandationMentorsTab } from "@/features/ai/components/mentors/RecommandationMentorsTab";
import { AnalyseApprofondieTab } from "@/features/ai/components/analyse/AnalyseApprofondieTab";
import { DiscussionIATab } from "@/features/ai/components/discussion/DiscussionIATab";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";
import type { AITabId } from "@/types/aiTypes";

export default function AssistantIAPage() {
  const { mentorshipId } = useParams<{ mentorshipId: string }>();
  const [activeTab, setActiveTab] = useState<AITabId>("resume");
  const [startupName, setStartupName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // endpoint pour aprés
        const summaries = await workspaceApi.getSummaries();
        const current = summaries.find((s) => s.id === mentorshipId);
        if (!cancelled) setStartupName(current?.startupName ?? "votre startup");
      } catch {
        if (!cancelled) setStartupName("votre startup");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [mentorshipId]);

  if (!startupName) return null;

  return (
    <div key={mentorshipId} className="space-y-6 p-6">
     
      <AITabsNav active={activeTab} onChange={setActiveTab} />

      {activeTab === "resume" && (
        <ResumeIATab startupName={startupName} mentorshipId={mentorshipId} />
      )}
      {activeTab === "mentors" && (
        <RecommandationMentorsTab startupName={startupName} mentorshipId={mentorshipId}/>
      )}
      {activeTab === "analyse" && (
        <AnalyseApprofondieTab startupName={startupName} />
      )}
      {activeTab === "discussion" && <DiscussionIATab />}
    </div>
  );
}
