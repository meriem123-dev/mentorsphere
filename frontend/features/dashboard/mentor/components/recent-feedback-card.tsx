import { Star } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import type { Feedback } from "@/types/dashTypes";

export function RecentFeedbackCard({ feedbacks }: { feedbacks: Feedback[] }) {
  return (
    <DashboardCard title="Derniers Feedbacks">
      <ul className="space-y-3">
        {feedbacks.map((feedback) => (
          <li key={feedback.id} className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white bg-brand-blue`}
                >
                  {feedback.initials}
                </div>
                <p className="text-sm font-medium text-foreground">{feedback.menteeName}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < feedback.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">&ldquo;{feedback.quote}&rdquo;</p>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}