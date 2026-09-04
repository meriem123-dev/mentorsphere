import { dashboardApi, type ParcoursData } from "../api/dashboardAPI";
import type { DashboardStats, WeeklyActivityPoint } from "@/types/dashTypes";

interface DashboardData {
  stats: DashboardStats;
  weeklyActivity: WeeklyActivityPoint[];
  parcours: ParcoursData;
}

export async function getDashboardData(startupId?: string): Promise<DashboardData> {
  const [stats, weeklyActivity, parcours] = await Promise.all([
    dashboardApi.getStats(),
    dashboardApi.getWeeklyActivity(),
    dashboardApi.getParcours(startupId),
  ]);

  return { stats, weeklyActivity, parcours };
}