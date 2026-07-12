import { Users, Calendar, Star as StarIcon, TrendingUp } from "lucide-react";
import { StatsGrid } from "@/features/dashboard/mentor/components/stats-grid";
import { SessionsActivityChart } from "@/features/dashboard/mentor/components/sessions-activity-chart";
import { MenteeProgressCard } from "@/features/dashboard/mentor/components/mentor-progress-card";
import { UpcomingSessionsCard } from "@/features/dashboard/mentor/components/upcoming-sessions-card";
import { RecentFeedbackCard } from "@/features/dashboard/mentor/components/recent-feedback-card";
import type {
  StatCardData,
  SessionActivityPoint,
  MenteeProgress,
  UpcomingSession,
  Feedback,
} from "@/types/dashTypes";

const stats: StatCardData[] = [
  { icon: Users, label: "Mentorés Actifs", value: "4", delta: "+1 ce mois", accent: "rose" },
  { icon: Calendar, label: "Sessions Totales", value: "47", delta: "+8 cette semaine", accent: "blue" },
  { icon: StarIcon, label: "Note Moyenne", value: "4.9", delta: "Top 5% mentors", accent: "rose" },
  { icon: TrendingUp, label: "Taux de Réussite", value: "92%", delta: "+3% ce mois", accent: "green" },
];

const activity: SessionActivityPoint[] = [
  { day: "Mar", sessions: 4 },
  { day: "Mer", sessions: 7 },
  { day: "Jeu", sessions: 9 },
  { day: "Ven", sessions: 6 },
  { day: "Sam", sessions: 5 },
  { day: "Dim", sessions: 6 },
];

const mentees: MenteeProgress[] = [
  { id: "1", name: "Elena Kovacs", progress: 68, accent: "rose" },
  { id: "2", name: "Tariq Hassan", progress: 45, accent: "blue" },
  { id: "3", name: "Linh Nguyen", progress: 61, accent: "rose" },
  { id: "4", name: "David Kim", progress: 18, accent: "blue" },
];

const sessions: UpcomingSession[] = [
  { id: "1", menteeName: "Elena Kovacs", initials: "EK", topic: "Revue Pitch Deck", when: "Aujourd'hui 15h00", accent: "rose" },
  { id: "2", menteeName: "Tariq Hassan", initials: "TH", topic: "Stratégie Go-to-Market", when: "Demain 11h00", accent: "blue" },
  { id: "3", menteeName: "Linh Nguyen", initials: "LN", topic: "Levée de fonds Pré-seed", when: "Vendredi 14h00", accent: "rose" },
];

const feedbacks: Feedback[] = [
  {
    id: "1",
    menteeName: "Elena Kovacs",
    initials: "EK",
    rating: 5,
    quote: "Sarah m'a aidé à pivoter ma stratégie de pricing. Résultat : +35% de conversion.",
    accent: "rose",
  },
  {
    id: "2",
    menteeName: "David Kim",
    initials: "DK",
    rating: 5,
    quote: "Conseils très concrets sur le go-to-market. Exactement ce dont j'avais besoin.",
    accent: "blue",
  },
];

export default function MentorDashboardPage() {
  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SessionsActivityChart data={activity} />
        <MenteeProgressCard mentees={mentees} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingSessionsCard sessions={sessions} />
        <RecentFeedbackCard feedbacks={feedbacks} />
      </div>
    </div>
  );
}