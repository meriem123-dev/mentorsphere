// features/mentor-dashboard/components/mentee-progress-card.tsx
import { DashboardCard } from "./dashboard-card";
import type { MenteeProgress } from "@/types/dashTypes";

export function MenteeProgressCard({ mentees }: { mentees: MenteeProgress[] }) {
  return (
    <DashboardCard title="Progression Mentorés">
      <ul className="space-y-4">
        {mentees.map((mentee) => (
          <li key={mentee.id}>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{mentee.name}</span>
              <span className="text-brand-blue">{mentee.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full bg-brand-blue`}
                style={{ width: `${mentee.progress}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}