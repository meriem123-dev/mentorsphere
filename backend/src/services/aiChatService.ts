import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { groq, GROQ_MODEL } from "../lib/groqClient";
import type {
  AIChatMessage,
  AIChatState,
  AIChatOutcome,
} from "../types/aiTypes";


const AI_WINDOW_MS = 60 * 60 * 1000; // fenêtre d'1h
const AI_MAX_MESSAGES = 20;
const HISTORY_CONTEXT_SIZE = 10; // derniers messages envoyés à Groq pour le contexte

function resolveWindow(windowStart: Date | null, attempts: number) {
  const windowActive =
    !!windowStart && Date.now() - windowStart.getTime() < AI_WINDOW_MS;
  return {
    attempts: windowActive ? attempts : 0,
    windowStart: windowActive ? windowStart : null,
  };
}

//helper construction du prompt
async function buildSystemPrompt(mentorshipId: string): Promise<string> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      status: true,
      mentor: {
        select: {
          profession: true,
          yearsOfExperience: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      entrepreneur: {
        select: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      startup: {
        select: {
          name: true,
          description: true,
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
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { title: true, category: true, progress: true },
      },
      tasks: {
        where: { status: { not: "done" } },
        orderBy: { dueDate: "asc" },
        take: 5,
        select: { title: true, priority: true, dueDate: true },
      },
      sessions: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
        select: { number: true, agenda: true, rawNotes: true, aiSummary: true },
      },
    },
  });

  const startupContext = mentorship.startup
    ? `Nom: ${mentorship.startup.name}
Description: ${mentorship.startup.description}
Domaine: ${mentorship.startup.domain}
Stade: ${mentorship.startup.stage}
Besoins: ${mentorship.startup.needs.join(", ") || "non précisés"}
Étapes du Startup Journey: ${
        mentorship.startup.steps.length > 0
          ? mentorship.startup.steps
              .map((s) => `${s.completed ? "✓" : "○"} ${s.title}`)
              .join(" | ")
          : "aucune étape définie"
      }`
    : "Aucun projet startup renseigné pour cet entrepreneur.";

  const objectivesContext =
    mentorship.objectives.length > 0
      ? mentorship.objectives
          .map((o) => `- ${o.title} (${o.category}, ${o.progress}% complété)`)
          .join("\n")
      : "Aucun objectif défini.";

  const tasksContext =
    mentorship.tasks.length > 0
      ? mentorship.tasks
          .map(
            (t) =>
              `- ${t.title} (priorité ${t.priority}, échéance ${t.dueDate.toLocaleDateString("fr-FR")})`,
          )
          .join("\n")
      : "Aucune tâche en cours.";

  const lastSession = mentorship.sessions[0];
  const lastSessionContext = lastSession
    ? `Session #${lastSession.number}${lastSession.agenda ? ` — Ordre du jour: ${lastSession.agenda}` : ""}${
        lastSession.rawNotes ? `\nNotes: ${lastSession.rawNotes}` : ""
      }`
    : "Aucune session tenue pour l'instant.";

  const mentorName = `${mentorship.mentor.user.firstName} ${mentorship.mentor.user.lastName}`;
  const entrepreneurName = `${mentorship.entrepreneur.user.firstName} ${mentorship.entrepreneur.user.lastName}`;

  return `Tu es l'assistant IA de MentorSphere, une plateforme de mentorat entrepreneurial. Tu réponds en français, de façon concise et actionnable, aux questions de l'entrepreneur sur son projet.

Mentorat entre ${entrepreneurName} (entrepreneur) et ${mentorName} (mentor, ${mentorship.mentor.profession ?? "profession non renseignée"}, ${mentorship.mentor.yearsOfExperience ?? "?"} ans d'expérience).

Contexte du projet:
${startupContext}

Objectifs actuels:
${objectivesContext}

Tâches en cours:
${tasksContext}

Dernière session:
${lastSessionContext}

Reste factuel, ne remplace pas le rôle du mentor humain, et invite à en discuter avec lui pour les décisions stratégiques importantes.
Formate tes réponses en Markdown pur, sans aucune balise HTML (pas de <br>, <b>, <div>, etc.). 
Si tu dois lister plusieurs éléments dans une cellule de tableau, utilise un point-virgule ou une liste à puces séparée du tableau plutôt qu'un saut de ligne HTML.`;
}

// Appelé au montage du composant : ne consomme AUCUNE tentative
// Chaque utilisateur (mentor, entrepreneur, collaborateur) a sa propre session
export async function getAIChatState(
  mentorshipId: string,
  userId: string,
): Promise<AIChatState> {
  const session = await prisma.aIChatSession.findUnique({
    where: { mentorshipId_userId: { mentorshipId, userId } },
  });

  const { attempts, windowStart } = resolveWindow(
    session?.windowStart ?? null,
    session?.attempts ?? 0,
  );

  return {
    messages: (session?.history as unknown as AIChatMessage[]) ?? [],
    attemptsRemaining: Math.max(0, AI_MAX_MESSAGES - attempts),
    windowResetAt: windowStart
      ? new Date(windowStart.getTime() + AI_WINDOW_MS).toISOString()
      : null,
  };
}

// Appelé à l'envoi d'un message : consomme une tentative si dispo, propre à l'utilisateur
export async function sendAIChatMessage(
  mentorshipId: string,
  userId: string,
  userMessage: string,
): Promise<AIChatOutcome> {
  const session = await prisma.aIChatSession.findUnique({
    where: { mentorshipId_userId: { mentorshipId, userId } },
  });

  const existingHistory =
    (session?.history as unknown as AIChatMessage[]) ?? [];
  const { attempts, windowStart } = resolveWindow(
    session?.windowStart ?? null,
    session?.attempts ?? 0,
  );

  if (attempts >= AI_MAX_MESSAGES) {
    return {
      messages: existingHistory,
      attemptsRemaining: 0,
      windowResetAt: new Date(
        (windowStart ?? new Date()).getTime() + AI_WINDOW_MS,
      ).toISOString(),
      limitReached: true,
    };
  }

  const systemPrompt = await buildSystemPrompt(mentorshipId);
  const recentHistory = existingHistory.slice(-HISTORY_CONTEXT_SIZE);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ],
    temperature: 0.5,
  });

  const assistantReply =
    completion.choices[0]?.message?.content ??
    "Désolé, je n'ai pas pu générer de réponse.";

  const now = new Date().toISOString();
  const updatedHistory: AIChatMessage[] = [
    ...existingHistory,
    {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantReply,
      createdAt: now,
    },
  ];

  const newWindowStart = windowStart ?? new Date();
  const newAttempts = attempts + 1;

  await prisma.aIChatSession.upsert({
    where: { mentorshipId_userId: { mentorshipId, userId } },
    create: {
      mentorshipId,
      userId,
      history: updatedHistory as unknown as Prisma.InputJsonValue,
      attempts: newAttempts,
      windowStart: newWindowStart,
    },
    update: {
      history: updatedHistory as unknown as Prisma.InputJsonValue,
      attempts: newAttempts,
      windowStart: newWindowStart,
    },
  });

  return {
    messages: updatedHistory,
    attemptsRemaining: Math.max(0, AI_MAX_MESSAGES - newAttempts),
    windowResetAt: new Date(
      newWindowStart.getTime() + AI_WINDOW_MS,
    ).toISOString(),
    limitReached: newAttempts >= AI_MAX_MESSAGES,
  };
}
