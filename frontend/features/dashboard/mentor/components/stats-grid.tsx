// features/mentor-dashboard/components/stats-grid.tsx
import { StatCard } from "./stat-card";
import type { StatCardData } from "../..//../../types/dashTypes";

export function StatsGrid({ stats }: { stats: StatCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}