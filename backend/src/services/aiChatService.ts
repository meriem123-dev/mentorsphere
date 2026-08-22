import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { groq, GROQ_MODEL } from "../lib/groqClient";
import type { AIChatMessage, AIChatState, AIChatOutcome } from "../types/aiTypes";

const AI_WINDOW_MS = 60 * 60 * 1000; // fenêtre d'1h
const AI_MAX_MESSAGES = 20;
const HISTORY_CONTEXT_SIZE = 10; // derniers messages envoyés à Groq pour le contexte

function resolveWindow(windowStart: Date | null, attempts: number) {
  const windowActive = !!windowStart && Date.now() - windowStart.getTime() < AI_WINDOW_MS;
  return {
    attempts: windowActive ? attempts : 0,
    windowStart: windowActive ? windowStart : null,
  };
}

async function buildSystemPrompt(mentorshipId: string): Promise<string> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      startup: {
        select: { name: true, description: true, domain: true, stage: true, needs: true },
      },
    },
  });

  const startupContext = mentorship.startup
    ? `Nom: ${mentorship.startup.name}
Description: ${mentorship.startup.description}
Domaine: ${mentorship.startup.domain}
Stade: ${mentorship.startup.stage}
Besoins: ${mentorship.startup.needs.join(", ") || "non précisés"}`
    : "Aucun projet startup renseigné pour cet entrepreneur.";

  return `Tu es l'assistant IA de MentorSphere, une plateforme de mentorat entrepreneurial. Tu réponds en français, de façon concise et actionnable, aux questions de l'entrepreneur sur son projet.

Contexte du projet:
${startupContext}

Reste factuel, ne remplace pas le rôle du mentor humain, et invite à en discuter avec lui pour les décisions stratégiques importantes.`;
}

// Appelé au montage du composant : ne consomme AUCUNE tentative
export async function getAIChatState(mentorshipId: string): Promise<AIChatState> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { aiChatHistory: true, aiChatAttempts: true, aiChatWindowStart: true },
  });

  const { attempts, windowStart } = resolveWindow(mentorship.aiChatWindowStart, mentorship.aiChatAttempts);

  return {
    messages: (mentorship.aiChatHistory as unknown as AIChatMessage[]) ?? [],
    attemptsRemaining: Math.max(0, AI_MAX_MESSAGES - attempts),
    windowResetAt: windowStart ? new Date(windowStart.getTime() + AI_WINDOW_MS).toISOString() : null,
  };
}

// Appelé à l'envoi d'un message : consomme une tentative si dispo
export async function sendAIChatMessage(
  mentorshipId: string,
  userMessage: string
): Promise<AIChatOutcome> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { aiChatHistory: true, aiChatAttempts: true, aiChatWindowStart: true },
  });

  const existingHistory = (mentorship.aiChatHistory as unknown as AIChatMessage[]) ?? [];
  const { attempts, windowStart } = resolveWindow(mentorship.aiChatWindowStart, mentorship.aiChatAttempts);

  if (attempts >= AI_MAX_MESSAGES) {
    return {
      messages: existingHistory,
      attemptsRemaining: 0,
      windowResetAt: new Date((windowStart ?? new Date()).getTime() + AI_WINDOW_MS).toISOString(),
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
    completion.choices[0]?.message?.content ?? "Désolé, je n'ai pas pu générer de réponse.";

  const now = new Date().toISOString();
  const updatedHistory: AIChatMessage[] = [
    ...existingHistory,
    { id: crypto.randomUUID(), role: "user", content: userMessage, createdAt: now },
    { id: crypto.randomUUID(), role: "assistant", content: assistantReply, createdAt: now },
  ];

  const newWindowStart = windowStart ?? new Date();
  const newAttempts = attempts + 1;

  await prisma.mentorship.update({
    where: { id: mentorshipId },
    data: {
      aiChatHistory: updatedHistory as unknown as Prisma.InputJsonValue,
      aiChatAttempts: newAttempts,
      aiChatWindowStart: newWindowStart,
    },
  });

  return {
    messages: updatedHistory,
    attemptsRemaining: Math.max(0, AI_MAX_MESSAGES - newAttempts),
    windowResetAt: new Date(newWindowStart.getTime() + AI_WINDOW_MS).toISOString(),
    limitReached: newAttempts >= AI_MAX_MESSAGES,
  };
}