import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { groq, GROQ_MODEL } from "../lib/groqClient";
import { getMentors } from "./mentorService";
import type { MentorMatch, MentorMatchesResult, AIGenerationState, AIGenerationOutcome } from "../types/aiTypes";

const AI_WINDOW_MS = 60 * 60 * 1000; // fenêtre d'1h
const AI_MAX_ATTEMPTS = 3;

async function buildFreshMentorMatches(
  mentorshipId: string,
): Promise<MentorMatchesResult> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: {
      entrepreneurId: true,
      startup: {
        select: { name: true, description: true, domain: true, stage: true, needs: true },
      },
    },
  });

  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { id: mentorship.entrepreneurId },
    select: { userId: true },
  });
  if (!entrepreneur) {
    return { matches: [], generatedAt: new Date().toISOString() };
  }

  const { mentors } = await getMentors({
    currentUserId: entrepreneur.userId,
    pageSize: 30,
  });

  if (mentors.length === 0) {
    return { matches: [], generatedAt: new Date().toISOString() };
  }

  const startupContext = mentorship.startup
    ? `Nom: ${mentorship.startup.name}
Description: ${mentorship.startup.description}
Domaine: ${mentorship.startup.domain}
Stade: ${mentorship.startup.stage}
Besoins: ${mentorship.startup.needs.join(", ") || "non précisés"}`
    : "Aucun projet startup renseigné pour cet entrepreneur.";

  const mentorsContext = mentors
    .map(
      (m: any, i: number) => `
Mentor ${i + 1} (id: ${m.id}):
Nom: ${m.user.firstName} ${m.user.lastName}
Profession: ${m.profession ?? "non renseignée"}
Expérience: ${m.yearsOfExperience ?? "non renseignée"}
Domaines: ${m.domains.map((d: any) => d.domain.name).join(", ") || "aucun"}
Mentorés actuels: ${m.menteeCount}`,
    )
    .join("\n");

  const prompt = `
Voici le profil d'un projet entrepreneurial:
${startupContext}

Voici la liste des mentors disponibles sur la plateforme:
${mentorsContext}

Pour chaque mentor pertinent (maximum 6, les plus pertinents uniquement), évalue la compatibilité avec ce projet.
Réponds UNIQUEMENT en JSON valide, sans markdown, avec ce format exact:
{
  "matches": [
    {
      "mentorId": "id du mentor tel que fourni",
      "matchScore": 0-100,
      "description": "1-2 phrases expliquant pourquoi ce mentor correspond à ce projet, en français",
      "tags": ["2-4 mots-clés courts illustrant la correspondance"]
    }
  ]
}
Classe par matchScore décroissant. N'invente aucun mentor hors de la liste fournie.
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let matches: MentorMatch[] = [];
  try {
    const parsed = JSON.parse(cleaned);
    const mentorById = new Map(mentors.map((m: any) => [m.id, m]));

    matches = (parsed.matches ?? [])
      .map((item: { mentorId: string; matchScore: number; description: string; tags: string[] }) => {
        const mentor = mentorById.get(item.mentorId);
        if (!mentor) return null;

        return {
          id: mentor.id,
          name: `${mentor.user.firstName} ${mentor.user.lastName}`,
          initials: `${mentor.user.firstName[0] ?? ""}${mentor.user.lastName[0] ?? ""}`.toUpperCase(),
          role: mentor.profession ?? "Mentor",
          company: mentor.user.city ?? "",
          description: item.description ?? "",
          tags: Array.isArray(item.tags) ? item.tags : [],
          matchScore: Math.round(Math.max(0, Math.min(100, item.matchScore ?? 0))),
          availability: mentor.menteeCount < 5 ? "available" : "busy",
          avatarUrl: mentor.user.profilePicture ?? undefined,
        } satisfies MentorMatch;
      })
      .filter((m: MentorMatch | null): m is MentorMatch => m !== null);
  } catch (err) {
    console.error("generateMentorMatches JSON parse error:", err, "raw:", raw);
    matches = [];
  }

  return { matches, generatedAt: new Date().toISOString() };
}

function resolveWindow(windowStart: Date | null, attempts: number) {
  const windowActive = !!windowStart && Date.now() - windowStart.getTime() < AI_WINDOW_MS;
  return {
    attempts: windowActive ? attempts : 0,
    windowStart: windowActive ? windowStart : null,
  };
}

// Appelé au montage du composant : ne consomme AUCUNE tentative
export async function getMentorMatchesState(mentorshipId: string): Promise<AIGenerationState<MentorMatchesResult>> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { mentorMatchesCache: true, mentorMatchesAttempts: true, mentorMatchesWindowStart: true },
  });

  const { attempts, windowStart } = resolveWindow(
    mentorship.mentorMatchesWindowStart,
    mentorship.mentorMatchesAttempts
  );

  return {
    result: (mentorship.mentorMatchesCache as unknown as MentorMatchesResult) ?? null,
    attemptsRemaining: Math.max(0, AI_MAX_ATTEMPTS - attempts),
    windowResetAt: windowStart ? new Date(windowStart.getTime() + AI_WINDOW_MS).toISOString() : null,
  };
}

// Appelé au clic sur "Générer" / "Régénérer" : consomme une tentative si dispo
export async function generateMentorMatches(mentorshipId: string): Promise<AIGenerationOutcome<MentorMatchesResult>> {
  const mentorship = await prisma.mentorship.findUniqueOrThrow({
    where: { id: mentorshipId },
    select: { mentorMatchesCache: true, mentorMatchesAttempts: true, mentorMatchesWindowStart: true },
  });

  const { attempts, windowStart } = resolveWindow(
    mentorship.mentorMatchesWindowStart,
    mentorship.mentorMatchesAttempts
  );

  if (attempts >= AI_MAX_ATTEMPTS) {
    const fallback = mentorship.mentorMatchesCache as unknown as MentorMatchesResult | null;
    return {
      result: fallback ?? { matches: [], generatedAt: new Date().toISOString() },
      attemptsRemaining: 0,
      windowResetAt: new Date((windowStart ?? new Date()).getTime() + AI_WINDOW_MS).toISOString(),
      limitReached: true,
    };
  }

  const result = await buildFreshMentorMatches(mentorshipId);
  const newWindowStart = windowStart ?? new Date();
  const newAttempts = attempts + 1;

  await prisma.mentorship.update({
    where: { id: mentorshipId },
    data: {
      mentorMatchesCache: result as unknown as Prisma.InputJsonValue,
      mentorMatchesGeneratedAt: new Date(),
      mentorMatchesAttempts: newAttempts,
      mentorMatchesWindowStart: newWindowStart,
    },
  });

  return {
    result,
    attemptsRemaining: Math.max(0, AI_MAX_ATTEMPTS - newAttempts),
    windowResetAt: new Date(newWindowStart.getTime() + AI_WINDOW_MS).toISOString(),
    limitReached: newAttempts >= AI_MAX_ATTEMPTS,
  };
}