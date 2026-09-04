import prisma from "../lib/prisma";

interface RateMentorParams {
  userId: string;
  mentorshipId: string;
  rating: number;
}

interface SubmitPlatformReviewParams {
  userId: string;
  rating: number;
  comment?: string;
}

function assertValidRating(rating: number) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("INVALID_RATING");
  }
}

//liste des mentorats acceptés à noter, avec moyenne du mentor et ma note existante
export const getMentorsToRate = async (userId: string) => {
  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
  });
  if (!entrepreneur) throw new Error("ENTREPRENEUR_NOT_FOUND");

  const mentorships = await prisma.mentorship.findMany({
    where: {
      entrepreneurId: entrepreneur.id,
      status: "ACCEPTED",
    },
    include: {
      startup: { select: { name: true } },
      review: true,
      mentor: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const mentorIds = [...new Set(mentorships.map((m) => m.mentorId))];

  const aggregates = await prisma.mentorReview.groupBy({
    by: ["mentorId"],
    where: { mentorId: { in: mentorIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const aggregateByMentor = new Map(
    aggregates.map((a) => [
      a.mentorId,
      { average: a._avg.rating ?? 0, count: a._count.rating },
    ]),
  );

  return mentorships.map((m) => {
    const agg = aggregateByMentor.get(m.mentorId) ?? { average: 0, count: 0 };
    return {
      mentorshipId: m.id,
      mentorId: m.mentorId,
      startupName: m.startup?.name ?? null,
      mentor: m.mentor.user,
      profession: m.mentor.profession,
      averageRating: agg.average,
      reviewsCount: agg.count,
      myRating: m.review?.rating ?? null,
      myComment: m.review?.comment ?? null,
    };
  });
};

interface RateMentorParams {
  userId: string;
  mentorshipId: string;
  rating: number;
  comment?: string;
}

//métier noter
export const rateMentor = async ({
  userId,
  mentorshipId,
  rating,
  comment,
}: RateMentorParams) => {
  assertValidRating(rating);

  const entrepreneur = await prisma.entrepreneur.findUnique({
    where: { userId },
  });
  if (!entrepreneur) throw new Error("ENTREPRENEUR_NOT_FOUND");

  const mentorship = await prisma.mentorship.findFirst({
    where: {
      id: mentorshipId,
      entrepreneurId: entrepreneur.id,
      status: "ACCEPTED",
    },
  });
  if (!mentorship) throw new Error("MENTORSHIP_NOT_FOUND");

  return prisma.mentorReview.upsert({
    where: { mentorshipId },
    create: {
      mentorshipId,
      mentorId: mentorship.mentorId,
      entrepreneurId: entrepreneur.id,
      rating,
      ...(comment !== undefined && { comment }),
    },
    update: {
      rating,
      ...(comment !== undefined && { comment }),
    },
  });
};

//avis plateforme existant 
export const getMyPlatformReview = async (userId: string) => {
  return prisma.platformReview.findUnique({ where: { userId } });
};

//créer/mettre à jour l'avis plateforme
export const submitPlatformReview = async ({
  userId,
  rating,
  comment,
}: SubmitPlatformReviewParams) => {
  assertValidRating(rating);

  return prisma.platformReview.upsert({
    where: { userId },
    create: {
      userId,
      rating,
      ...(comment !== undefined && { comment }),
    },
    update: {
      rating,
      ...(comment !== undefined && { comment }),
    },
  });
};

//témoignages publics 
export const getTestimonials = async (limit = 6) => {
  const reviews = await prisma.platformReview.findMany({
    where: {
      rating: { gte: 4 },
      comment: { not: null },
    },
    include: {
      user: {
        select: { firstName: true, lastName: true, profilePicture: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return reviews.filter((r) => r.comment && r.comment.trim().length > 0);
};
