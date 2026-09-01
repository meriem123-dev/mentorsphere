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

// Mapper colocalisé (pattern établi) : MentorMatch (riche, IA) -> RecommendedMentor (affichage dashboard)
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
  });
  const [loading, setLoading] = useState(true);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [generatingMentorMatches, setGeneratingMentorMatches] = useState(false);

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
        mentorMatches: (mentorMatchesState.result?.matches ?? []).map(
          mapMentorMatchToRecommendedMentor,
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
        const [dashboardData, startups, mentorships] = await Promise.all([
          getDashboardData(),
          dashboardApi.getStartupsList(),
          dashboardApi.getMentorships(),
        ]);

        if (cancelled) return;

        const defaultMentorshipId = mentorships[0]?.id ?? null;

        setData((prev) => ({
          ...prev,
          ...dashboardData,
          startups,
          mentorships,
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
        mentorMatches: (outcome.result?.matches ?? []).map(
          mapMentorMatchToRecommendedMentor,
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
          Les suggestions IA et recommandations de mentors apparaîtront ici une
          fois que tu auras un mentorat accepté.
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
          />
        </div>
      )}
    </div>
  );
}
