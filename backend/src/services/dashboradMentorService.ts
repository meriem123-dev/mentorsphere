import prisma from "../lib/prisma";
import type { Accent } from "../types/dashTypes";

const ACCENTS: Accent[] = ["rose", "blue", "green"];

function accentAt(index: number): Accent {
  return ACCENTS[index % ACCENTS.length] ?? "rose";
}

function initialsOf(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatSessionLabel(scheduledAt: Date, now: Date): string {
  const time = scheduledAt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isSameDay =
    scheduledAt.getFullYear() === now.getFullYear() &&
    scheduledAt.getMonth() === now.getMonth() &&
    scheduledAt.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    scheduledAt.getFullYear() === tomorrow.getFullYear() &&
    scheduledAt.getMonth() === tomorrow.getMonth() &&
    scheduledAt.getDate() === tomorrow.getDate();

  if (isSameDay) return `Aujourd'hui ${time}`;
  if (isTomorrow) return `Demain ${time}`;

  const dateLabel = scheduledAt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${dateLabel} ${time}`;
}

async function getMentorId(userId: string): Promise<string> {
  const mentor = await prisma.mentor.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!mentor) throw new Error("Profil mentor introuvable");
  return mentor.id;
}

// --- Statistiques principales ---
export async function getMentorDashboardStats(userId: string) {
  const mentorId = await getMentorId(userId);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const mentorships = await prisma.mentorship.findMany({
    where: { mentorId, status: "ACCEPTED" },
    select: {
      id: true,
      createdAt: true,
      startup: {
        select: { steps: { select: { completed: true } } },
      },
    },
  });

  const mentorshipIds = mentorships.map((m) => m.id);

  const activeMentees = mentorships.length;
  const newMenteesThisMonth = mentorships.filter(
    (m) => m.createdAt >= monthStart,
  ).length;
  const activeMenteesDelta =
    newMenteesThisMonth > 0
      ? `+${newMenteesThisMonth} ce mois`
      : "Aucun nouveau ce mois";

  const progressRates = mentorships
    .filter((m) => m.startup && m.startup.steps.length > 0)
    .map((m) => {
      const total = m.startup!.steps.length;
      const done = m.startup!.steps.filter((s) => s.completed).length;
      return done / total;
    });

  const successRate =
    progressRates.length > 0
      ? Math.round(
          (progressRates.reduce((a, b) => a + b, 0) / progressRates.length) *
            100,
        )
      : 0;

  const [
    totalCompletedSessions,
    sessionsCompletedThisWeek,
    upcomingSessionsList,
    upcomingSessionsCount,
  ] = await Promise.all([
    prisma.session.count({
      where: { mentorshipId: { in: mentorshipIds }, status: "COMPLETED" },
    }),
    prisma.session.count({
      where: {
        mentorshipId: { in: mentorshipIds },
        status: "COMPLETED",
        scheduledAt: { gte: weekStart },
      },
    }),
    prisma.session.findMany({
      where: {
        mentorshipId: { in: mentorshipIds },
        status: "SCHEDULED",
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      select: { scheduledAt: true },
      take: 1,
    }),
    prisma.session.count({
      where: {
        mentorshipId: { in: mentorshipIds },
        status: "SCHEDULED",
        scheduledAt: { gte: now },
      },
    }),
  ]);

  const sessionsDelta =
    sessionsCompletedThisWeek > 0
      ? `+${sessionsCompletedThisWeek} cette semaine`
      : "Aucune cette semaine";

  const nextSession = upcomingSessionsList[0];

  const nextSessionLabel = nextSession
    ? formatSessionLabel(nextSession.scheduledAt, now)
    : "Aucune session prévue";

  return {
    activeMentees,
    activeMenteesDelta,
    sessionsCompleted: totalCompletedSessions,
    sessionsDelta,
    successRate,
    successRateDelta:
      progressRates.length > 0 ? "Basé sur roadmap active" : "Aucune donnée",
    upcomingSessionsCount,
    nextSessionLabel,
  };
}

// --- Progression des mentorés ---
export async function getMentorMenteeProgress(userId: string) {
  const mentorId = await getMentorId(userId);

  const mentorships = await prisma.mentorship.findMany({
    where: { mentorId, status: "ACCEPTED" },
    select: {
      id: true,
      entrepreneur: {
        select: { user: { select: { firstName: true, lastName: true } } },
      },
      startup: {
        select: { steps: { select: { completed: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return mentorships.map((m, index) => {
    const total = m.startup?.steps.length ?? 0;
    const done = m.startup?.steps.filter((s) => s.completed).length ?? 0;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      id: m.id,
      name: `${m.entrepreneur.user.firstName} ${m.entrepreneur.user.lastName}`,
      progress,
      accent: accentAt(index),
    };
  });
}

// --- Activité sessions sur les 7 derniers jours ---
const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getMentorSessionsActivity(userId: string) {
  const mentorId = await getMentorId(userId);

  const mentorships = await prisma.mentorship.findMany({
    where: { mentorId },
    select: { id: true },
  });
  const mentorshipIds = mentorships.map((m) => m.id);

  const now = new Date();
  const rangeStart = startOfDay(new Date(now));
  rangeStart.setDate(rangeStart.getDate() - 6);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(rangeStart);
    date.setDate(rangeStart.getDate() + i);
    return { date, label: DAY_LABELS[date.getDay()] };
  });

  const sessions = await prisma.session.findMany({
    where: {
      mentorshipId: { in: mentorshipIds },
      scheduledAt: { gte: rangeStart },
    },
    select: { scheduledAt: true },
  });

  return days.map(({ date, label }) => ({
    day: label,
    sessions: sessions.filter((s) => isSameDay(s.scheduledAt, date)).length,
  }));
}

// --- Prochaines sessions ---
export async function getMentorUpcomingSessions(userId: string, limit = 5) {
  const mentorId = await getMentorId(userId);
  const now = new Date();

  const mentorships = await prisma.mentorship.findMany({
    where: { mentorId },
    select: { id: true },
  });
  const mentorshipIds = mentorships.map((m) => m.id);

  const sessions = await prisma.session.findMany({
    where: {
      mentorshipId: { in: mentorshipIds },
      status: "SCHEDULED",
      scheduledAt: { gte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
    select: {
      id: true,
      number: true,
      agenda: true,
      scheduledAt: true,
      mentorship: {
        select: {
          id: true,
          entrepreneur: {
            select: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      },
    },
  });

  return sessions.map((s, index) => {
    const firstName = s.mentorship.entrepreneur.user.firstName;
    const lastName = s.mentorship.entrepreneur.user.lastName;

    return {
      id: s.id,
      mentorshipId: s.mentorship.id,
      menteeName: `${firstName} ${lastName}`,
      initials: initialsOf(firstName, lastName),
      topic: s.agenda ?? `Session ${s.number}`,
      when: formatSessionLabel(s.scheduledAt, now),
      accent: accentAt(index),
    };
  });
}
