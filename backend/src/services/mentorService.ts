import prisma from "../lib/prisma";

interface GetMentorsParams {
  search?: string | undefined;
  domain?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  currentUserId: string;
}

interface RatingAggregate {
  averageRating: number;
  reviewsCount: number;
}

async function getRatingAggregatesByMentorIds(
  mentorIds: string[],
): Promise<Map<string, RatingAggregate>> {
  if (mentorIds.length === 0) return new Map();

  const aggregates = await prisma.mentorReview.groupBy({
    by: ["mentorId"],
    where: { mentorId: { in: mentorIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return new Map(
    aggregates.map((a) => [
      a.mentorId,
      { averageRating: a._avg.rating ?? 0, reviewsCount: a._count.rating },
    ]),
  );
}

//métier recup tous les mentors
export const getMentors = async ({
  search,
  domain,
  page = 1,
  pageSize = 12,
  currentUserId,
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

  const currentEntrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId: currentUserId },
  });

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
          where: currentEntrepreneur
            ? {
                OR: [
                  { status: "ACCEPTED" },
                  { entrepreneurId: currentEntrepreneur.id },
                ],
              }
            : { status: "ACCEPTED" },
          select: {
            id: true,
            status: true,
            entrepreneurId: true,
            startupId: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.mentor.count({ where }),
  ]);

  const ratingByMentor = await getRatingAggregatesByMentorIds(
    mentors.map((m: any) => m.id),
  );

  return {
    mentors: mentors.map((mentor: any) => {
      const menteeCount = mentor.mentorships.filter(
        (m: any) => m.status === "ACCEPTED",
      ).length;
      const myRequests = currentEntrepreneur
        ? mentor.mentorships.filter(
            (m: any) =>
              m.entrepreneurId === currentEntrepreneur.id &&
              (m.status === "PENDING" || m.status === "ACCEPTED"),
          )
        : [];

      const rating = ratingByMentor.get(mentor.id) ?? {
        averageRating: 0,
        reviewsCount: 0,
      };

      return {
        ...mentor,
        mentorships: mentor.mentorships.filter(
          (m: any) => m.status === "ACCEPTED",
        ),
        menteeCount,
        myMentorshipRequests: myRequests.map((m: any) => ({
          startupId: m.startupId,
          status: m.status,
        })),
        averageRating: rating.averageRating,
        reviewsCount: rating.reviewsCount,
      };
    }),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

//métier recup un mentor
export const getMentorById = async (id: string, currentUserId: string) => {
  const currentEntrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId: currentUserId },
  });

  const mentor = await prisma.mentor.findUnique({
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
          availabilities: true,
          socialLinks: true,
        },
      },
      domains: { include: { domain: true } },
      mentorships: {
        where: currentEntrepreneur
          ? {
              OR: [
                { status: "ACCEPTED" },
                { entrepreneurId: currentEntrepreneur.id },
              ],
            }
          : { status: "ACCEPTED" },
        select: { id: true, status: true, entrepreneurId: true },
      },
    },
  });

  if (!mentor) return null;

  const menteeCount = mentor.mentorships.filter(
    (m: any) => m.status === "ACCEPTED",
  ).length;
  const myRequest = currentEntrepreneur
    ? mentor.mentorships.find(
        (m: any) => m.entrepreneurId === currentEntrepreneur.id,
      )
    : undefined;

  const ratingAggregate = await prisma.mentorReview.aggregate({
    where: { mentorId: id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    ...mentor,
    mentorships: mentor.mentorships.filter((m: any) => m.status === "ACCEPTED"),
    menteeCount,
    mentorshipStatus: myRequest?.status ?? null,
    averageRating: ratingAggregate._avg.rating ?? 0,
    reviewsCount: ratingAggregate._count.rating,
  };
};