import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

interface GetEntrepreneursInput {
  userId: string;
  search?: string | undefined;
  domain?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

//liste des entrepreneurs avec recherche, filtre domaine, pagination
export const getEntrepreneurs = async (input: GetEntrepreneursInput) => {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));
  const search = input.search?.trim();

  const where: Prisma.EntrepreneurWhereInput = {
    user: {
      id: { not: input.userId },
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    ...(input.domain && {
      domains: { some: { domain: { name: input.domain } } },
    }),
  };

  const [entrepreneurs, total] = await prisma.$transaction([
    prisma.entrepreneur.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            coverPicture: true,
            city: true,
            country: true,
            bio: true,
          },
        },
        domains: { include: { domain: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.entrepreneur.count({ where }),
  ]);

  return {
    entrepreneurs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

//un entrepreneur par id
export const getEntrepreneurById = async (id: string, currentUserId?: string) => {
  const currentMentor = currentUserId
    ? await prisma.mentor.findUnique({ where: { userId: currentUserId } })
    : null;

  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bio: true,
          profilePicture: true,
          coverPicture: true,
          city: true,
          country: true,
          languages: { include: { language: true } },
          skills: { include: { skill: true } },
          socialLinks: true,
        },
      },
      domains: { include: { domain: true } },
      startups: {
        where: { isPublic: true },
        include: {
          steps: { orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      mentorships: currentMentor
        ? {
            where: { mentorId: currentMentor.id },
            select: { id: true, status: true },
          }
        : false,
    },
  });

  if (!entrepreneur) return null;

  const myMentorshipStatus = currentMentor
    ? (entrepreneur as any).mentorships?.[0]?.status ?? null
    : null;

  const startups = entrepreneur.startups.map((startup) => {
    const total = startup.steps.length;
    const completed = startup.steps.filter((s) => s.completed).length;
    return {
      ...startup,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  return {
    ...entrepreneur,
    startups,
    mentorshipStatus: myMentorshipStatus,
  };
};