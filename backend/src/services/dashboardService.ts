import prisma from "../lib/prisma";
import type { DashboardStats } from "../types/dashTypes";
import { groq, GROQ_MODEL } from "../lib/groqClient";
import { resolveWindow, computeWindowResetAt } from "../lib/aiRateLimit";
import type { AISuggestion } from "../types/dashTypes";
import { Prisma } from "@prisma/client";

//helpers
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day; // lundi = premier jour
  d.setDate(d.getDate() + diff);
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

//métier dashboard stats
export async function getEntrepreneurDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!entrepreneur) {
    throw new Error("Profil entrepreneur introuvable");
  }

  const entrepreneurId = entrepreneur.id;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now);

  // --- Projets ---
  const startups = await prisma.startup.findMany({
    where: { entrepreneurId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      steps: { select: { completed: true, updatedAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeProjects = startups.length;
  const newProjectsThisMonth = startups.filter(
    (s) => s.createdAt >= monthStart,
  ).length;
  const activeProjectsDelta =
    newProjectsThisMonth > 0
      ? `+${newProjectsThisMonth} ce mois`
      : "Aucun nouveau ce mois";

  // Projet "principal" pour la progression = le plus récemment actif
  const primaryStartup = startups[0] ?? null;

  let progression = 0;
  let progressionDelta = "Aucune donnée";

  if (primaryStartup && primaryStartup.steps.length > 0) {
    const totalSteps = primaryStartup.steps.length;
    const completedSteps = primaryStartup.steps.filter(
      (s) => s.completed,
    ).length;
    progression = Math.round((completedSteps / totalSteps) * 100);

    const completedThisMonth = primaryStartup.steps.filter(
      (s) => s.completed && s.updatedAt >= monthStart,
    ).length;
    const deltaPoints = Math.round((completedThisMonth / totalSteps) * 100);
    progressionDelta =
      deltaPoints > 0 ? `+${deltaPoints}% ce mois` : "Stable ce mois";
  }

  // --- Sessions ---
  const mentorships = await prisma.mentorship.findMany({
    where: { entrepreneurId },
    select: { id: true },
  });
  const mentorshipIds = mentorships.map((m) => m.id);

  const [
    totalCompletedSessions,
    sessionsCompletedThisWeek,
    upcomingSessionsList,
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
  ]);

  const mentorSessionsDelta =
    sessionsCompletedThisWeek > 0
      ? `+${sessionsCompletedThisWeek} cette semaine`
      : "Aucune cette semaine";

  const nextSession = upcomingSessionsList[0];

  const nextSessionLabel = nextSession
    ? formatSessionLabel(nextSession.scheduledAt, now)
    : "Aucune session prévue";

  const upcomingSessionsCount = await prisma.session.count({
    where: {
      mentorshipId: { in: mentorshipIds },
      status: "SCHEDULED",
      scheduledAt: { gte: now },
    },
  });

  return {
    activeProjects,
    activeProjectsDelta,
    mentorSessions: totalCompletedSessions,
    mentorSessionsDelta,
    upcomingSessions: upcomingSessionsCount,
    nextSessionLabel,
    progression,
    progressionDelta,
  };
}

// --- Liste des projets ---
export async function getEntrepreneurStartupsList(userId: string) {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!entrepreneur) throw new Error("Profil entrepreneur introuvable");

  return prisma.startup.findMany({
    where: { entrepreneurId: entrepreneur.id },
    select: { id: true, name: true, stage: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

// --- Parcours / progression pour un projet donné ---
export async function getEntrepreneurParcours(
  userId: string,
  startupId?: string,
) {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!entrepreneur) throw new Error("Profil entrepreneur introuvable");

  let startup;

  if (startupId) {
    // On vérifie que le projet appartient bien à cet entrepreneur (sécurité)
    startup = await prisma.startup.findFirst({
      where: { id: startupId, entrepreneurId: entrepreneur.id },
      select: {
        id: true,
        name: true,
        stage: true,
        steps: { select: { completed: true } },
      },
    });
    if (!startup) {
      throw new Error(
        "Projet introuvable ou n'appartenant pas à cet entrepreneur",
      );
    }
  } else {
    // Défaut : le projet créé le plus récemment
    startup = await prisma.startup.findFirst({
      where: { entrepreneurId: entrepreneur.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        stage: true,
        steps: { select: { completed: true } },
      },
    });
  }

  if (!startup) {
    return {
      startupId: null,
      projectName: "Aucun projet",
      stage: "IDEE",
      progression: 0,
    };
  }

  const totalSteps = startup.steps.length;
  const completedSteps = startup.steps.filter((s) => s.completed).length;
  const progression =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return {
    startupId: startup.id,
    projectName: startup.name,
    stage: startup.stage,
    progression,
  };
}

// --- Activité hebdomadaire (sessions + messages semaine en cours) ---
const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]; // index = Date.getDay()

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getEntrepreneurWeeklyActivity(userId: string) {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!entrepreneur) throw new Error("Profil entrepreneur introuvable");

  const mentorships = await prisma.mentorship.findMany({
    where: { entrepreneurId: entrepreneur.id },
    select: { id: true },
  });
  const mentorshipIds = mentorships.map((m) => m.id);

  const now = new Date();
  const weekStart = startOfWeek(now); // lundi 00:00
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return { date, label: DAY_LABELS[date.getDay()] };
  });

  const [sessions, messages] = await Promise.all([
    prisma.session.findMany({
      where: {
        mentorshipId: { in: mentorshipIds },
        scheduledAt: { gte: weekStart, lt: weekEnd },
      },
      select: { scheduledAt: true },
    }),
    prisma.message.findMany({
      where: {
        mentorshipId: { in: mentorshipIds },
        createdAt: { gte: weekStart, lt: weekEnd },
      },
      select: { createdAt: true },
    }),
  ]);

  return days.map(({ date, label }) => ({
    day: label,
    sessions: sessions.filter((s) => isSameDay(s.scheduledAt, date)).length,
    messages: messages.filter((m) => isSameDay(m.createdAt, date)).length,
  }));
}

const MAX_SUGGESTIONS_ATTEMPTS = 3;

//métier check mentorship
export async function assertMentorshipOwnership(
  userId: string,
  mentorshipId: string,
) {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!entrepreneur) throw new Error("Profil entrepreneur introuvable");

  const mentorship = await prisma.mentorship.findFirst({
    where: { id: mentorshipId, entrepreneurId: entrepreneur.id },
    select: { id: true },
  });
  if (!mentorship) {
    throw new Error(
      "Mentorship introuvable ou n'appartenant pas à cet entrepreneur",
    );
  }
}

//métier créer le contexte
async function buildMentorshipContext(mentorshipId: string) {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { startupId: true },
  });

  const [objectives, tasks, sessions, documentsCount] = await Promise.all([
    prisma.objective.findMany({
      where: { mentorshipId },
      select: { progress: true },
    }),
    prisma.task.findMany({
      where: { mentorshipId },
      select: { status: true, dueDate: true },
    }),
    prisma.session.findMany({
      where: { mentorshipId, status: "COMPLETED" },
      orderBy: { scheduledAt: "desc" },
      select: { scheduledAt: true },
      take: 1,
    }),
    prisma.workspaceDocument.count({ where: { mentorshipId } }),
  ]);

  const now = new Date();
  const lateTasks = tasks.filter(
    (t) => t.status !== "done" && t.dueDate < now,
  ).length;
  const avgObjectivesProgress =
    objectives.length > 0
      ? Math.round(
          objectives.reduce((sum, o) => sum + o.progress, 0) /
            objectives.length,
        )
      : null;

  let roadmapDone = 0;
  let roadmapTotal = 0;
  if (mentorship.startupId) {
    const steps = await prisma.startupStep.findMany({
      where: { startupId: mentorship.startupId },
      select: { completed: true },
    });
    roadmapTotal = steps.length;
    roadmapDone = steps.filter((s) => s.completed).length;
  }

  return {
    avgObjectivesProgress,
    roadmapDone,
    roadmapTotal,
    lateTasks,
    totalTasks: tasks.length,
    hasDocuments: documentsCount > 0,
    daysSinceLastSession: sessions[0]
      ? Math.floor(
          (now.getTime() - sessions[0].scheduledAt.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null,
  };
}

//métier suggestions IA
async function buildFreshMentorshipSuggestions(
  mentorshipId: string,
): Promise<AISuggestion[]> {
  const context = await buildMentorshipContext(mentorshipId);

  const prompt = `
Situation actuelle de ce mentorat :
- Progression moyenne des objectifs: ${context.avgObjectivesProgress !== null ? `${context.avgObjectivesProgress}%` : "Aucun objectif défini"}
- Roadmap: ${context.roadmapTotal > 0 ? `${context.roadmapDone}/${context.roadmapTotal} étapes terminées` : "Aucune roadmap"}
- Tâches en retard: ${context.lateTasks}/${context.totalTasks}
- Documents partagés: ${context.hasDocuments ? "Oui" : "Non"}
- Jours depuis la dernière session: ${context.daysSinceLastSession ?? "Aucune session tenue"}

Génère 3 suggestions concrètes et actionnables en français, basées UNIQUEMENT sur ces données (pas d'invention).
Réponds UNIQUEMENT en JSON valide, sans markdown :
{ "suggestions": ["...", "...", "..."] }
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    const texts: string[] = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
      : [];
    return texts.slice(0, 3).map((text, i) => ({ id: String(i + 1), text }));
  } catch {
    return [];
  }
}

// Appelé au montage
export async function getMentorshipSuggestionsState(
  userId: string,
  mentorshipId: string,
) {
  await assertMentorshipOwnership(userId, mentorshipId);

  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      dashboardSuggestionsCache: true,
      dashboardSuggestionsAttempts: true,
      dashboardSuggestionsWindowStart: true,
    },
  });

  const { attempts, windowStart } = resolveWindow(
    mentorship.dashboardSuggestionsWindowStart,
    mentorship.dashboardSuggestionsAttempts,
  );

  return {
    result:
      (mentorship.dashboardSuggestionsCache as unknown as AISuggestion[]) ?? [],
    attemptsRemaining: Math.max(0, MAX_SUGGESTIONS_ATTEMPTS - attempts),
    windowResetAt: computeWindowResetAt(windowStart),
  };
}

// Appelé sur clic
export async function generateMentorshipSuggestions(
  userId: string,
  mentorshipId: string,
) {
  await assertMentorshipOwnership(userId, mentorshipId);

  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      dashboardSuggestionsCache: true,
      dashboardSuggestionsAttempts: true,
      dashboardSuggestionsWindowStart: true,
    },
  });

  const { attempts, windowStart } = resolveWindow(
    mentorship.dashboardSuggestionsWindowStart,
    mentorship.dashboardSuggestionsAttempts,
  );

  if (attempts >= MAX_SUGGESTIONS_ATTEMPTS) {
    return {
      result:
        (mentorship.dashboardSuggestionsCache as unknown as AISuggestion[]) ??
        [],
      attemptsRemaining: 0,
      windowResetAt: computeWindowResetAt(windowStart ?? new Date()),
      limitReached: true,
    };
  }

  const result = await buildFreshMentorshipSuggestions(mentorshipId);
  const newWindowStart = windowStart ?? new Date();
  const newAttempts = attempts + 1;

  await prisma.mentorship.update({
    where: { id: mentorshipId },
    data: {
      dashboardSuggestionsCache: result as unknown as Prisma.InputJsonValue,
      dashboardSuggestionsGeneratedAt: new Date(),
      dashboardSuggestionsAttempts: newAttempts,
      dashboardSuggestionsWindowStart: newWindowStart,
    },
  });

  return {
    result,
    attemptsRemaining: Math.max(0, MAX_SUGGESTIONS_ATTEMPTS - newAttempts),
    windowResetAt: computeWindowResetAt(newWindowStart),
    limitReached: newAttempts >= MAX_SUGGESTIONS_ATTEMPTS,
  };
}

// --- Liste des mentorships (pour le sélecteur) ---
export async function getEntrepreneurMentorshipsList(userId: string) {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!entrepreneur) throw new Error("Profil entrepreneur introuvable");

  const mentorships = await prisma.mentorship.findMany({
    where: { entrepreneurId: entrepreneur.id, status: "ACCEPTED" },
    select: {
      id: true,
      mentor: {
        select: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      startup: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return mentorships.map((m) => ({
    id: m.id,
    mentorName: `${m.mentor.user.firstName} ${m.mentor.user.lastName}`,
    startupName: m.startup?.name ?? null,
  }));
}
