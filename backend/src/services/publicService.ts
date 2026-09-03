import prisma from "../lib/prisma";

// stats globales pour landing page et login
export const getPlatformStats = async () => {
  const [mentorsCount, entrepreneursCount, startupsAccompanied] = await Promise.all([
    prisma.mentor.count(),
    prisma.entrepreneur.count(),
    // startups avec au moins un mentorat accepté = "accompagnées"
    prisma.startup.count({
      where: {
        mentorships: {
          some: { status: "ACCEPTED" },
        },
      },
    }),
  ]);

  return {
    mentorsCount,
    entrepreneursCount,
    startupsAccompanied,
  };
};

// témoignages les mieux notés avec un commentaire
export const getTestimonials = async (limit = 3) => {
  const reviews = await prisma.platformReview.findMany({
    where: { comment: { not: null } },
    orderBy: { rating: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
          mentor: { select: { profession: true } },
          entrepreneur: { select: { profession: true } },
        },
      },
    },
  });

  return reviews.map((review) => {
    const { user } = review;
    const profession = user.mentor?.profession ?? user.entrepreneur?.profession;
    const roleLabel = profession ?? (user.role === "MENTOR" ? "Mentor" : "Entrepreneur");

    return {
      id: review.id,
      quote: review.comment as string,
      name: `${user.firstName} ${user.lastName}`,
      role: roleLabel,
      rating: review.rating,
    };
  });
};