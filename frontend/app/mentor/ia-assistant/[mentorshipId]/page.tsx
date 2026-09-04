"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AITabsNav } from "@/features/ai/components/AITabsNav";
import { ResumeIATab } from "@/features/ai/components/resume/ResumeIATab";
import { AnalyseApprofondieTab } from "@/features/ai/components/analyse/AnalyseApprofondieTab";
import { DiscussionIATab } from "@/features/ai/components/discussion/DiscussionIATab";
import { MentorBriefingTab } from "@/features/ai/components/Briefing/MentorBriefingTab";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";
import type { AITabId } from "@/types/aiTypes";

export default function AssistantIAMentorPage() {
  const { mentorshipId } = useParams<{ mentorshipId: string }>();
  const [activeTab, setActiveTab] = useState<AITabId>("resume");
  const [startupName, setStartupName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // endpoint
        const summaries = await workspaceApi.getSummaries();
        const current = summaries.find((s) => s.id === mentorshipId);
        if (!cancelled) setStartupName(current?.startupName ?? "votre mentoré");
      } catch {
        if (!cancelled) setStartupName("votre mentoré");
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
      <AITabsNav active={activeTab} onChange={setActiveTab} variant="mentor" />

      {activeTab === "resume" && (
        <ResumeIATab startupName={startupName} mentorshipId={mentorshipId} />
      )}
      {activeTab === "analyse" && (
        <AnalyseApprofondieTab startupName={startupName} mentorshipId={mentorshipId} />
      )}
      {activeTab === "discussion" && <DiscussionIATab mentorshipId={mentorshipId} />}
      {activeTab === "briefing" && <MentorBriefingTab mentorshipId={mentorshipId} startupName={startupName}/>}
    </div>
  );
}