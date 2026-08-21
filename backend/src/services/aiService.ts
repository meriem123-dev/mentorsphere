import { Prisma } from "@prisma/client";
import  prisma  from "../lib/prisma"; 
import { groq, GROQ_MODEL } from "../lib/groqClient";
import type { AISummaryResult, AIKpi, AIAlert, AISessionsSummary } from "../types/aiTypes";


interface HealthMetrics {
  avgObjectivesProgress: number | null; // null si aucun objectif
  roadmapDone: number;
  roadmapTotal: number; // 0 si pas de roadmap
  lateTasks: number;
  totalTasks: number;
  completedSessions: number;
  totalSessions: number;
}

async function computeKpis(
  mentorshipId: string
): Promise<{ kpis: AIKpi[]; startupId: string | null; metrics: HealthMetrics }> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { startupId: true },
  });

  const [objectives, tasks, sessions] = await Promise.all([
    prisma.objective.findMany({ where: { mentorshipId }, select: { progress: true } }),
    prisma.task.findMany({ where: { mentorshipId }, select: { status: true, dueDate: true } }),
    prisma.session.findMany({ where: { mentorshipId }, select: { status: true } }),
  ]);

  const kpis: AIKpi[] = [];
  const metrics: HealthMetrics = {
    avgObjectivesProgress: null,
    roadmapDone: 0,
    roadmapTotal: 0,
    lateTasks: 0,
    totalTasks: tasks.length,
    completedSessions: 0,
    totalSessions: sessions.length,
  };

  if (objectives.length > 0) {
    const avgProgress = Math.round(
      objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length
    );
    metrics.avgObjectivesProgress = avgProgress;
    kpis.push({
      label: "Objectifs en cours",
      value: `${avgProgress}%`,
      delta: "",
      deltaTrend: avgProgress >= 50 ? "up" : "down",
      source: "computed",
    });
  }

  const now = new Date();
  const lateTasks = tasks.filter((t) => t.status !== "done" && t.dueDate < now).length;
  metrics.lateTasks = lateTasks;
  kpis.push({
    label: "Tâches en retard",
    value: String(lateTasks),
    delta: "",
    deltaTrend: lateTasks > 0 ? "down" : "up",
    source: "computed",
  });

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
  metrics.completedSessions = completedSessions;
  if (sessions.length > 0) {
    kpis.push({
      label: "Sessions tenues",
      value: `${completedSessions}/${sessions.length}`,
      delta: "",
      deltaTrend: "up",
      source: "computed",
    });
  }

  if (mentorship.startupId) {
    const steps = await prisma.startupStep.findMany({
      where: { startupId: mentorship.startupId },
      select: { completed: true },
    });
    if (steps.length > 0) {
      const doneSteps = steps.filter((s) => s.completed).length;
      metrics.roadmapDone = doneSteps;
      metrics.roadmapTotal = steps.length;
      kpis.push({
        label: "Étapes roadmap",
        value: `${doneSteps}/${steps.length}`,
        delta: "",
        deltaTrend: "up",
        source: "computed",
      });
    }
  }

  return { kpis, startupId: mentorship.startupId, metrics };
}

function computeHealthScore(metrics: HealthMetrics): number {
  const components: { weight: number; score: number }[] = [];

  // Objectifs
  if (metrics.avgObjectivesProgress !== null) {
    components.push({ weight: 0.3, score: metrics.avgObjectivesProgress });
  }

  // Roadmap
  if (metrics.roadmapTotal > 0) {
    components.push({
      weight: 0.3,
      score: (metrics.roadmapDone / metrics.roadmapTotal) * 100,
    });
  }

  // Tâches
  if (metrics.totalTasks > 0) {
    const lateRatio = metrics.lateTasks / metrics.totalTasks;
    components.push({ weight: 0.2, score: Math.max(0, 100 - lateRatio * 100) });
  }

  // Sessions
  if (metrics.totalSessions > 0) {
    components.push({
      weight: 0.2,
      score: (metrics.completedSessions / metrics.totalSessions) * 100,
    });
  }

  // Aucune donnée du tout
  if (components.length === 0) return 50;

  // Renormalisation
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const weightedScore = components.reduce((sum, c) => sum + c.weight * c.score, 0);
  const score = weightedScore / totalWeight;

  return Math.round(Math.max(0, Math.min(100, score)));
}

async function getSessionsSummary(mentorshipId: string): Promise<AISessionsSummary | null> {
  const sessions = await prisma.session.findMany({
    where: { mentorshipId, status: "COMPLETED", aiSummary: { not: Prisma.JsonNull } },
    select: { aiSummary: true },
    orderBy: { scheduledAt: "desc" },
    take: 5,
  });

  if (sessions.length === 0) return null;

  const summariesText = sessions
    .map((s, i) => `Session ${i + 1}: ${JSON.stringify(s.aiSummary)}`)
    .join("\n");

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Tu résumes en 2-3 phrases les points clés discutés lors de plusieurs sessions de mentorat, en français, de façon factuelle et concise.",
      },
      { role: "user", content: summariesText },
    ],
    temperature: 0.3,
  });

  return {
    periodLabel: `${sessions.length} dernières sessions`,
    sessionsCount: sessions.length,
    content: completion.choices[0]?.message?.content ?? "",
  };
}

async function generateSynthesisAndAlerts(
  kpis: AIKpi[],
  healthScore: number,
  sessionsSummary: AISessionsSummary | null
): Promise<{ synthesis: string; alerts: AIAlert[] }> {
  const prompt = `
Voici les KPIs calculés pour ce projet (score de santé global: ${healthScore}/100):
${kpis.map((k) => `- ${k.label}: ${k.value}`).join("\n")}

${sessionsSummary ? `Résumé des dernières sessions: ${sessionsSummary.content}` : "Aucune session récente."}

Réponds UNIQUEMENT en JSON valide, sans markdown, avec ce format exact:
{
  "synthesis": "2-3 phrases de synthèse en français sur l'état du projet",
  "alerts": [{ "severity": "info" | "warning" | "critical", "message": "..." }]
}
Génère entre 0 et 3 alertes pertinentes basées uniquement sur les KPIs fournis, pas d'invention.
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
    const alerts: AIAlert[] = (parsed.alerts ?? []).map((a: { severity: AIAlert["severity"]; message: string }, i: number) => ({
      id: String(i + 1),
      severity: a.severity,
      message: a.message,
    }));
    return { synthesis: parsed.synthesis ?? "", alerts };
  } catch {
    return { synthesis: "Synthèse indisponible pour le moment.", alerts: [] };
  }
}

async function buildFreshAISummary(mentorshipId: string): Promise<AISummaryResult> {
  const { kpis, metrics } = await computeKpis(mentorshipId);
  const healthScore = computeHealthScore(metrics);
  const sessionsSummary = await getSessionsSummary(mentorshipId);
  const { synthesis, alerts } = await generateSynthesisAndAlerts(kpis, healthScore, sessionsSummary);

  return {
    healthScore,
    healthScoreDelta: "",
    kpis,
    sessionsSummary,
    synthesis,
    alerts,
    generatedAt: new Date().toISOString(),
  };
}

const AI_COOLDOWN_MS = 60 * 60 * 1000; // 1 heure

export async function generateAISummary(mentorshipId: string): Promise<AISummaryResult> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { aiSummaryCache: true, aiSummaryGeneratedAt: true },
  });

  const isCacheFresh =
    !!mentorship.aiSummaryGeneratedAt &&
    Date.now() - mentorship.aiSummaryGeneratedAt.getTime() < AI_COOLDOWN_MS;

  if (isCacheFresh && mentorship.aiSummaryCache) {
    return mentorship.aiSummaryCache as unknown as AISummaryResult;
  }

  const result = await buildFreshAISummary(mentorshipId);

  await prisma.mentorship.update({
    where: { id: mentorshipId },
    data: {
      aiSummaryCache: result as unknown as Prisma.InputJsonValue,
      aiSummaryGeneratedAt: new Date(),
    },
  });

  return result;
}