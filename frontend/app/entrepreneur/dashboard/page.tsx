"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { StatsCards } from "@/features/dashboard/entrepreneur/components/stat-cards";
import { WeeklyActivityChart } from "@/features/dashboard/entrepreneur/components/weekly-activity-chart";
import { ParcoursProgress } from "@/features/dashboard/entrepreneur/components/parcours-progress";
import { AISuggestions } from "@/features/dashboard/entrepreneur/components/ai-suggestions";
import { RecommendedMentors } from "@/features/dashboard/entrepreneur/components/recommended-mentors";
import { ComboBox } from "@/components/ui/ComboBox";
import { getDashboardData } from "@/features/dashboard/entrepreneur/services/get-dashboard-data";
import {
  dashboardApi,
  type StartupListItem,
  type ParcoursData,
  type MentorshipListItem,
} from "@/features/dashboard/entrepreneur/api/dashboardAPI";
import type {
  DashboardStats,
  WeeklyActivityPoint,
  AISuggestion,
  RecommendedMentor,
} from "@/types/dashTypes";
import type { MentorMatch } from "@/types/aiTypes";
import { RequestMentorshipModal } from "@/features/explore/components/request-mentorship-modal";
import { mentorshipApi } from "@/features/mentorat/api/mentorshipAPI";
import type { Mentorship } from "@/types/mentoratTypes";

// Mapper
function mapMentorMatchToRecommendedMentor(
  match: MentorMatch,
): RecommendedMentor {
  return {
    id: match.id,
    name: match.name,
    title: match.role,
    initials: match.initials,
    avatarUrl: match.avatarUrl,
  };
}

function enrichMentorMatches(
  matches: RecommendedMentor[],
  sentRequests: Mentorship[],
  totalStartups: number,
): RecommendedMentor[] {
  return matches.map((mentor) => {
    // REJECTED et CANCELLED n'empêchent pas une nouvelle demande
    const activeStartupIds = sentRequests
      .filter(
        (r) =>
          r.mentorId === mentor.id &&
          (r.status === "PENDING" || r.status === "ACCEPTED"),
      )
      .map((r) => r.startupId)
      .filter((id): id is string => id !== null);

    return {
      ...mentor,
      requestedStartupIds: activeStartupIds,
      hasRequestedAll:
        totalStartups > 0 && activeStartupIds.length >= totalStartups,
    };
  });
}

interface DashboardState {
  stats: DashboardStats | null;
  weeklyActivity: WeeklyActivityPoint[];
  parcours: ParcoursData | null;
  startups: StartupListItem[];
  mentorships: MentorshipListItem[];
  selectedMentorshipId: string | null;
  suggestions: AISuggestion[];
  suggestionsAttemptsRemaining: number;
  mentorMatches: RecommendedMentor[];
  mentorMatchesAttemptsRemaining: number;
  sentRequests: Mentorship[];
}

export default function EntrepreneurDashboardPage() {
  const [data, setData] = useState<DashboardState>({
    stats: null,
    weeklyActivity: [],
    parcours: null,
    startups: [],
    mentorships: [],
    selectedMentorshipId: null,
    suggestions: [],
    suggestionsAttemptsRemaining: 3,
    mentorMatches: [],
    mentorMatchesAttemptsRemaining: 3,
    sentRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [generatingMentorMatches, setGeneratingMentorMatches] = useState(false);
  const [mentorshipModal, setMentorshipModal] = useState<{
    mentorId: string;
    mentorName: string;
    requestedStartupIds: string[];
  } | null>(null);

  const loadMentorshipScopedData = useCallback(async (mentorshipId: string) => {
    try {
      const [suggestionsState, mentorMatchesState] = await Promise.all([
        dashboardApi.getSuggestionsState(mentorshipId),
        dashboardApi.getMentorMatchesState(mentorshipId),
      ]);
      setData((prev) => ({
        ...prev,
        suggestions: suggestionsState.result,
        suggestionsAttemptsRemaining: suggestionsState.attemptsRemaining,
        mentorMatches: enrichMentorMatches(
          (mentorMatchesState.result?.matches ?? []).map(
            mapMentorMatchToRecommendedMentor,
          ),
          prev.sentRequests,
          prev.startups.length,
        ),
        mentorMatchesAttemptsRemaining: mentorMatchesState.attemptsRemaining,
      }));
    } catch (err) {
      toast.error("Impossible de charger les données IA du mentorat");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [dashboardData, startups, mentorships, sentRequestsRes] =
          await Promise.all([
            getDashboardData(),
            dashboardApi.getStartupsList(),
            dashboardApi.getMentorships(),
            mentorshipApi.getSent(),
          ]);

        if (cancelled) return;

        const defaultMentorshipId = mentorships[0]?.id ?? null;

        setData((prev) => ({
          ...prev,
          ...dashboardData,
          startups,
          mentorships,
          sentRequests: sentRequestsRes.requests,
          selectedMentorshipId: defaultMentorshipId,
        }));
        setLoading(false);

        if (defaultMentorshipId) {
          await loadMentorshipScopedData(defaultMentorshipId);
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          toast.error("Impossible de charger le tableau de bord");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [loadMentorshipScopedData]);

  async function handleSelectStartup(startupId: string) {
    try {
      const parcours = await dashboardApi.getParcours(startupId);
      setData((prev) => ({ ...prev, parcours }));
    } catch (err) {
      toast.error("Impossible de charger le parcours");
    }
  }

  function handleRequestMentorship(
    mentorId: string,
    mentorName: string,
    requestedStartupIds: string[],
  ) {
    setMentorshipModal({ mentorId, mentorName, requestedStartupIds });
  }

  async function handleMentorshipSuccess() {
    setMentorshipModal(null);
    try {
      const { requests } = await mentorshipApi.getSent();
      setData((prev) => ({
        ...prev,
        sentRequests: requests,
        mentorMatches: enrichMentorMatches(
          prev.mentorMatches,
          requests,
          prev.startups.length,
        ),
      }));
    } catch (err) {
      // silencieux, resynchronisé au prochain chargement
    }
  }

  async function handleSelectMentorship(mentorshipId: string) {
    setData((prev) => ({ ...prev, selectedMentorshipId: mentorshipId }));
    await loadMentorshipScopedData(mentorshipId);
  }

  async function handleRegenerateSuggestions() {
    if (!data.selectedMentorshipId) return;
    setGeneratingSuggestions(true);
    try {
      const outcome = await dashboardApi.generateSuggestions(
        data.selectedMentorshipId,
      );
      setData((prev) => ({
        ...prev,
        suggestions: outcome.result,
        suggestionsAttemptsRemaining: outcome.attemptsRemaining,
      }));
      if (outcome.limitReached) {
        toast.info("Limite de générations atteinte pour cette heure.");
      }
    } catch (err) {
      toast.error("Impossible de générer les suggestions");
    } finally {
      setGeneratingSuggestions(false);
    }
  }

  async function handleRegenerateMentorMatches() {
    if (!data.selectedMentorshipId) return;
    setGeneratingMentorMatches(true);
    try {
      const outcome = await dashboardApi.generateMentorMatches(
        data.selectedMentorshipId,
      );
      setData((prev) => ({
        ...prev,
        mentorMatches: enrichMentorMatches(
          (outcome.result?.matches ?? []).map(
            mapMentorMatchToRecommendedMentor,
          ),
          data.sentRequests,
          data.startups.length,
        ),
        mentorMatchesAttemptsRemaining: outcome.attemptsRemaining,
      }));
      if (outcome.limitReached) {
        toast.info("Limite de générations atteinte pour cette heure.");
      }
    } catch (err) {
      toast.error("Impossible de générer les recommandations");
    } finally {
      setGeneratingMentorMatches(false);
    }
  }

  if (loading || !data.stats || !data.parcours) {
    return <div>Chargement...</div>;
  }

  const mentorshipOptions = data.mentorships.map(
    (m) => m.startupName ?? `Mentorat ${m.mentorName}`,
  );

  const selectedMentorshipLabel =
    data.mentorships.find((m) => m.id === data.selectedMentorshipId)
      ?.startupName ??
    (data.selectedMentorshipId
      ? `Mentorat ${data.mentorships.find((m) => m.id === data.selectedMentorshipId)?.mentorName}`
      : "");

  return (
    <>
      <div className="flex flex-col gap-6">
        <StatsCards stats={data.stats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyActivityChart data={data.weeklyActivity} />
          </div>
          <ParcoursProgress
            projectName={data.parcours.projectName}
            stage={data.parcours.stage}
            progression={data.parcours.progression}
            startups={data.startups}
            selectedStartupId={data.parcours.startupId}
            onSelectStartup={handleSelectStartup}
          />
        </div>

        {data.mentorships.length > 1 && (
          <div className="w-64">
            <ComboBox
              label="Mentorat"
              searchable={false}
              size="sm"
              options={mentorshipOptions}
              value={selectedMentorshipLabel}
              onChange={(name) => {
                const mentorship = data.mentorships.find(
                  (m) => (m.startupName ?? `Mentorat ${m.mentorName}`) === name,
                );
                if (mentorship) handleSelectMentorship(mentorship.id);
              }}
            />
          </div>
        )}

        {data.mentorships.length === 0 ? (
          <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
            Les suggestions IA et recommandations de mentors apparaîtront ici
            une fois que tu auras un mentorat accepté.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AISuggestions
              suggestions={data.suggestions}
              onRegenerate={handleRegenerateSuggestions}
              isGenerating={generatingSuggestions}
              attemptsRemaining={data.suggestionsAttemptsRemaining}
            />
            <RecommendedMentors
              mentors={data.mentorMatches}
              onRegenerate={handleRegenerateMentorMatches}
              isGenerating={generatingMentorMatches}
              attemptsRemaining={data.mentorMatchesAttemptsRemaining}
              onRequestMentorship={handleRequestMentorship}
            />
          </div>
        )}
      </div>

      <RequestMentorshipModal
        open={mentorshipModal !== null}
        onClose={() => setMentorshipModal(null)}
        mentorId={mentorshipModal?.mentorId ?? null}
        mentorName={mentorshipModal?.mentorName}
        requestedStartupIds={mentorshipModal?.requestedStartupIds ?? []}
        onSuccess={handleMentorshipSuccess}
      />
    </>
  );
}
