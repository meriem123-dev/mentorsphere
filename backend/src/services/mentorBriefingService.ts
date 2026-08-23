import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { groq, GROQ_MODEL } from "../lib/groqClient";
import type {
  AIGenerationState,
  AIGenerationOutcome,
  MentorBriefingResult,
} from "../types/aiTypes";

const AI_WINDOW_MS = 60 * 60 * 1000; // fenêtre d'1h
const AI_MAX_ATTEMPTS = 3;
const PERIOD_DAYS = 14;

function resolveWindow(windowStart: Date | null, attempts: number) {
  const windowActive =
    !!windowStart && Date.now() - windowStart.getTime() < AI_WINDOW_MS;
  return {
    attempts: windowActive ? attempts : 0,
    windowStart: windowActive ? windowStart : null,
  };
}

async function gatherBriefingData(mentorshipId: string) {
  const periodStart = new Date(Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000);

  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      entrepreneur: {
        select: { user: { select: { firstName: true, lastName: true } } },
      },
      startup: {
        select: {
          name: true,
          domain: true,
          stage: true,
          needs: true,
          steps: {
            orderBy: { order: "asc" },
            select: { title: true, completed: true },
          },
        },
      },
      objectives: {
        select: { title: true, category: true, progress: true },
      },
      tasks: {
        where: { createdAt: { gte: periodStart } },
        select: { title: true, status: true, priority: true, dueDate: true },
      },
      sessions: {
        where: { scheduledAt: { gte: periodStart } },
        orderBy: { scheduledAt: "desc" },
        select: { number: true, agenda: true, rawNotes: true, status: true, scheduledAt: true },
      },
    },
  });

  return { mentorship, periodStart };
}

function buildPrompt(
  mentorship: Awaited<ReturnType<typeof gatherBriefingData>>["mentorship"]
): string {
  const entrepreneurName = `${mentorship.entrepreneur.user.firstName} ${mentorship.entrepreneur.user.lastName}`;

  const startupContext = mentorship.startup
    ? `Projet: ${mentorship.startup.name} (${mentorship.startup.domain}, stade ${mentorship.startup.stage})
Besoins: ${mentorship.startup.needs.join(", ") || "non précisés"}
Étapes: ${mentorship.startup.steps.map((s) => `${s.completed ? "✓" : "○"} ${s.title}`).join(" | ") || "aucune"}`
    : "Aucun projet startup renseigné.";

  const objectivesContext = mentorship.objectives.length
    ? mentorship.objectives.map((o) => `- ${o.title} (${o.category}): ${o.progress}%`).join("\n")
    : "Aucun objectif défini.";

  const tasksContext = mentorship.tasks.length
    ? mentorship.tasks
        .map((t) => `- ${t.title} [${t.status}] priorité ${t.priority}, échéance ${t.dueDate.toLocaleDateString("fr-FR")}`)
        .join("\n")
    : "Aucune tâche sur la période.";

  const sessionsContext = mentorship.sessions.length
    ? mentorship.sessions
        .map((s) => `- Session #${s.number} (${s.status}) le ${s.scheduledAt.toLocaleDateString("fr-FR")}${s.agenda ? ` — ${s.agenda}` : ""}${s.rawNotes ? `\n  Notes: ${s.rawNotes}` : ""}`)
        .join("\n")
    : "Aucune session sur la période.";

  return `Tu es l'assistant IA de MentorSphere. Tu prépares pour un MENTOR une synthèse d'avant-session sur son mentoré ${entrepreneurName}, sur les ${PERIOD_DAYS} derniers jours.

Contexte projet:
${startupContext}

Objectifs:
${objectivesContext}

Tâches (période):
${tasksContext}

Sessions (période):
${sessionsContext}

Réponds UNIQUEMENT en JSON valide (pas de préambule, pas de balises markdown, pas de \`\`\`json), avec exactement cette forme:
{
  "summary": "1-2 phrases factuelles résumant l'évolution du mentoré",
  "keyEvolutions": [
    { "label": "nom court de l'indicateur", "value": "valeur affichée ex: 8 → 10 ou +28% vs J-14", "trend": "positive" | "negative" | "neutral" }
  ],
  "suggestedAgenda": [
    { "title": "point à aborder en session", "durationMinutes": 15 }
  ]
}

Base les évolutions et l'agenda uniquement sur les données fournies ci-dessus, sans inventer de chiffres. Maximum 4 keyEvolutions et 5 points d'agenda. Reste concis et actionnable.`;
}

async function callGroqForBriefing(mentorshipId: string): Promise<MentorBriefingResult> {
  const { mentorship } = await gatherBriefingData(mentorshipId);
  const prompt = buildPrompt(mentorship);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed: {
    summary?: string;
    keyEvolutions?: Array<{ label: string; value: string; trend: string }>;
    suggestedAgenda?: Array<{ title: string; durationMinutes: number }>;
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = {};
  }

  return {
    summary: parsed.summary ?? "Synthèse indisponible pour le moment.",
    periodLabel: `${PERIOD_DAYS} derniers jours`,
    keyEvolutions: (parsed.keyEvolutions ?? []).map((e) => ({
      id: crypto.randomUUID(),
      label: e.label,
      value: e.value,
      trend: (["positive", "negative", "neutral"].includes(e.trend) ? e.trend : "neutral") as MentorBriefingResult["keyEvolutions"][number]["trend"],
    })),
    suggestedAgenda: (parsed.suggestedAgenda ?? []).map((a) => ({
      id: crypto.randomUUID(),
      title: a.title,
      durationMinutes: a.durationMinutes ?? 15,
    })),
    generatedAt: new Date().toISOString(),
  };
}

/// GET — appelé au montage, ne consomme aucune tentative
export async function getMentorBriefingState(
  mentorshipId: string
): Promise<AIGenerationState<MentorBriefingResult>> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      mentorBriefingCache: true,
      mentorBriefingAttempts: true,
      mentorBriefingWindowStart: true,
    },
  });

  const { attempts, windowStart } = resolveWindow(
    mentorship.mentorBriefingWindowStart,
    mentorship.mentorBriefingAttempts
  );

  return {
    result: (mentorship.mentorBriefingCache as unknown as MentorBriefingResult) ?? null,
    attemptsRemaining: Math.max(0, AI_MAX_ATTEMPTS - attempts),
    windowResetAt: windowStart
      ? new Date(windowStart.getTime() + AI_WINDOW_MS).toISOString()
      : null,
  };
}

// POST — bouton Générer/Régénérer, consomme une tentative si dispo
export async function generateMentorBriefing(
  mentorshipId: string
): Promise<AIGenerationOutcome<MentorBriefingResult>> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      mentorBriefingCache: true,
      mentorBriefingAttempts: true,
      mentorBriefingWindowStart: true,
    },
  });

  const { attempts, windowStart } = resolveWindow(
    mentorship.mentorBriefingWindowStart,
    mentorship.mentorBriefingAttempts
  );

  if (attempts >= AI_MAX_ATTEMPTS) {
    const cached = (mentorship.mentorBriefingCache as unknown as MentorBriefingResult) ?? null;
    if (!cached) {
      // pas de cache et plus de tentatives : on force une réponse malgré tout
      // (cas limite rare — décide si tu préfères throw une 429 côté controller à la place)
    }
    return {
      result: cached as MentorBriefingResult,
      attemptsRemaining: 0,
      windowResetAt: new Date(
        (windowStart ?? new Date()).getTime() + AI_WINDOW_MS
      ).toISOString(),
      limitReached: true,
    };
  }

  const result = await callGroqForBriefing(mentorshipId);
  const newWindowStart = windowStart ?? new Date();
  const newAttempts = attempts + 1;

  await prisma.mentorship.update({
    where: { id: mentorshipId },
    data: {
      mentorBriefingCache: result as unknown as Prisma.InputJsonValue,
      mentorBriefingGeneratedAt: new Date(),
      mentorBriefingAttempts: newAttempts,
      mentorBriefingWindowStart: newWindowStart,
    },
  });

  return {
    result,
    attemptsRemaining: Math.max(0, AI_MAX_ATTEMPTS - newAttempts),
    windowResetAt: new Date(newWindowStart.getTime() + AI_WINDOW_MS).toISOString(),
    limitReached: newAttempts >= AI_MAX_ATTEMPTS,
  };
}