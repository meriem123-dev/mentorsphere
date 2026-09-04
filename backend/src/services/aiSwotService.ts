import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { groq, GROQ_MODEL } from "../lib/groqClient";
import type { AIGenerationState, AIGenerationOutcome, SwotAnalysisResult } from "../types/aiTypes";

const AI_WINDOW_MS = 60 * 60 * 1000; // fenêtre d'1h
const AI_MAX_ATTEMPTS = 3;

const EMPTY_SWOT: SwotAnalysisResult = {
  forces: [],
  faiblesses: [],
  opportunites: [],
  menaces: [],
  insight: "",
  generatedAt: new Date().toISOString(),
};

//helper
async function buildFreshSwotAnalysis(mentorshipId: string): Promise<SwotAnalysisResult> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      startup: {
        select: {
          name: true,
          description: true,
          domain: true,
          stage: true,
          needs: true,
        },
      },
    },
  });

  if (!mentorship.startup) {
    return EMPTY_SWOT;
  }

  const [objectives, tasks] = await Promise.all([
    prisma.objective.findMany({ where: { mentorshipId }, select: { title: true, progress: true } }),
    prisma.task.findMany({ where: { mentorshipId }, select: { status: true } }),
  ]);

  const startupContext = `
Nom: ${mentorship.startup.name}
Description: ${mentorship.startup.description}
Domaine: ${mentorship.startup.domain}
Stade: ${mentorship.startup.stage}
Besoins exprimés: ${mentorship.startup.needs.join(", ") || "non précisés"}
Objectifs en cours: ${objectives.map((o) => `${o.title} (${o.progress}%)`).join(", ") || "aucun"}
Tâches: ${tasks.length} au total, ${tasks.filter((t) => t.status === "done").length} terminées
`;

  const prompt = `
Voici le profil d'un projet entrepreneurial:
${startupContext}

Effectue une analyse SWOT (Forces, Faiblesses, Opportunités, Menaces) réaliste et concise pour ce projet.
Réponds UNIQUEMENT en JSON valide, sans markdown, avec ce format exact:
{
  "forces": ["3-4 points courts en français"],
  "faiblesses": ["3-4 points courts en français"],
  "opportunites": ["3-4 points courts en français"],
  "menaces": ["3-4 points courts en français"],
  "insight": "2-3 phrases de synthèse actionnable en français, donnant une recommandation stratégique concrète"
}
Sois factuel, base-toi uniquement sur les informations fournies, n'invente pas de données chiffrées précises.
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
    return {
      forces: Array.isArray(parsed.forces) ? parsed.forces : [],
      faiblesses: Array.isArray(parsed.faiblesses) ? parsed.faiblesses : [],
      opportunites: Array.isArray(parsed.opportunites) ? parsed.opportunites : [],
      menaces: Array.isArray(parsed.menaces) ? parsed.menaces : [],
      insight: parsed.insight ?? "",
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("buildFreshSwotAnalysis JSON parse error:", err, "raw:", raw);
    return { ...EMPTY_SWOT, generatedAt: new Date().toISOString() };
  }
}

function resolveWindow(windowStart: Date | null, attempts: number) {
  const windowActive = !!windowStart && Date.now() - windowStart.getTime() < AI_WINDOW_MS;
  return {
    attempts: windowActive ? attempts : 0,
    windowStart: windowActive ? windowStart : null,
  };
}

// Appelé au montage du composant : ne consomme AUCUNE tentative
export async function getSwotAnalysisState(
  mentorshipId: string
): Promise<AIGenerationState<SwotAnalysisResult>> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { swotCache: true, swotAttempts: true, swotWindowStart: true },
  });

  const { attempts, windowStart } = resolveWindow(mentorship.swotWindowStart, mentorship.swotAttempts);

  return {
    result: (mentorship.swotCache as unknown as SwotAnalysisResult) ?? null,
    attemptsRemaining: Math.max(0, AI_MAX_ATTEMPTS - attempts),
    windowResetAt: windowStart ? new Date(windowStart.getTime() + AI_WINDOW_MS).toISOString() : null,
  };
}

// Appelé au clic sur "Générer" / "Régénérer" : consomme une tentative si dispo
export async function generateSwotAnalysis(
  mentorshipId: string
): Promise<AIGenerationOutcome<SwotAnalysisResult>> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { swotCache: true, swotAttempts: true, swotWindowStart: true },
  });

  const { attempts, windowStart } = resolveWindow(mentorship.swotWindowStart, mentorship.swotAttempts);

  if (attempts >= AI_MAX_ATTEMPTS) {
    const fallback = mentorship.swotCache as unknown as SwotAnalysisResult | null;
    return {
      result: fallback ?? EMPTY_SWOT,
      attemptsRemaining: 0,
      windowResetAt: new Date((windowStart ?? new Date()).getTime() + AI_WINDOW_MS).toISOString(),
      limitReached: true,
    };
  }

  const result = await buildFreshSwotAnalysis(mentorshipId);
  const newWindowStart = windowStart ?? new Date();
  const newAttempts = attempts + 1;

  await prisma.mentorship.update({
    where: { id: mentorshipId },
    data: {
      swotCache: result as unknown as Prisma.InputJsonValue,
      swotGeneratedAt: new Date(),
      swotAttempts: newAttempts,
      swotWindowStart: newWindowStart,
    },
  });

  return {
    result,
    attemptsRemaining: Math.max(0, AI_MAX_ATTEMPTS - newAttempts),
    windowResetAt: new Date(newWindowStart.getTime() + AI_WINDOW_MS).toISOString(),
    limitReached: newAttempts >= AI_MAX_ATTEMPTS,
  };
}