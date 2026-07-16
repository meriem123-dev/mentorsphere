// backend/src/services/mentorService.ts
import prisma from "../lib/prisma";

interface GetMentorsParams {
  search?: string | undefined;
  domain?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export const getMentors = async ({
  search,
  domain,
  page = 1,
  pageSize = 12,
}: GetMentorsParams) => {
  const where: any = {
    user: { isActive: true },
  };

  if (search) {
    where.user = {
      ...where.user,
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  if (domain && domain !== "Tous") {
    where.domains = {
      some: { domain: { name: domain } },
    };
  }

  const [mentors, total] = await Promise.all([
    prisma.mentor.findMany({
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
          },
        },
        domains: { include: { domain: true } },
        mentorships: {
          where: { status: "ACCEPTED" },
          select: { id: true },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.mentor.count({ where }),
  ]);

  return {
    mentors,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const getMentorById = async (id: string) => {
  return prisma.mentor.findUnique({
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
          socialLinks: true,
        },
      },
      domains: { include: { domain: true } },
      mentorships: {
        where: { status: "ACCEPTED" },
        select: { id: true },
      },
    },
  });
};