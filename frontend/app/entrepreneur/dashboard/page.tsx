
import { StatsCards } from "@/features/dashboard/entrepreneur/components/stat-cards";
import { WeeklyActivityChart } from "@/features/dashboard/entrepreneur/components/weekly-activity-chart";
import {ParcoursProgress } from "@/features/dashboard/entrepreneur/components/parcours-progress";
import { AISuggestions } from "@/features/dashboard/entrepreneur/components/ai-suggestions";
import { RecommendedMentors } from "@/features/dashboard/entrepreneur/components/recommended-mentors";
import { getDashboardData } from "@/features/dashboard/entrepreneur/services/get-dashboard-data";

export default async function EntrepreneurDashboardPage() {
  const { stats, weeklyActivity, aiSuggestions, recommendedMentors, parcours } =
    await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyActivityChart data={weeklyActivity} />
        </div>
        <ParcoursProgress
          projectName={parcours.projectName}
          stage={parcours.stage}
          progression={parcours.progression}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AISuggestions suggestions={aiSuggestions} />
        <RecommendedMentors mentors={recommendedMentors} />
      </div>
    </div>
  );
}