import { api } from "@/lib/api";
import type {
  MentorToRate,
  PlatformTestimonial,
  PlatformReview,
  PlatformReviewPayload,
} from "@/types/feedbackTypes";

interface MentorToRateApiResponse {
  mentorshipId: string;
  mentorId: string;
  startupName: string | null;
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  profession: string | null;
  averageRating: number;
  reviewsCount: number;
  myRating: number | null;
  myComment: string | null;
}

// Mapper
function mapMentorToRate(raw: MentorToRateApiResponse): MentorToRate {
  return {
    mentorId: raw.mentorId,
    mentorshipId: raw.mentorshipId,
    startupName: raw.startupName,
    name: `${raw.mentor.firstName} ${raw.mentor.lastName}`,
    title: raw.profession ?? "Mentor",
    initials: `${raw.mentor.firstName[0] ?? ""}${raw.mentor.lastName[0] ?? ""}`.toUpperCase(),
    avatarUrl: raw.mentor.profilePicture ?? undefined,
    averageRating: raw.averageRating,
    reviewsCount: raw.reviewsCount,
    myRating: raw.myRating,
    myComment: raw.myComment,
  };
}

interface TestimonialApiResponse {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; profilePicture: string | null };
}

function mapTestimonial(raw: TestimonialApiResponse): PlatformTestimonial {
  return {
    id: raw.id,
    author: `${raw.user.firstName} ${raw.user.lastName}`,
    date: new Date(raw.createdAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    rating: raw.rating,
    quote: raw.comment ?? "",
    initials: `${raw.user.firstName[0] ?? ""}${raw.user.lastName[0] ?? ""}`.toUpperCase(),
  };
}

export const feedbackApi = {
  async getMentorsToRate(): Promise<MentorToRate[]> {
    const { data } = await api.get<MentorToRateApiResponse[]>(
      "api/feedback/mentors-to-rate",
    );
    return data.map(mapMentorToRate);
  },

  async rateMentor(mentorshipId: string, rating: number, comment?: string): Promise<void> {
    await api.post(`api/feedback/mentor/${mentorshipId}`, { rating, comment });
  },

  async getMyPlatformReview(): Promise<PlatformReview | null> {
    const { data } = await api.get<PlatformReview | null>(
      "api/feedback/platform/me",
    );
    return data;
  },

  async submitPlatformReview(payload: PlatformReviewPayload): Promise<void> {
    await api.post("api/feedback/platform", payload);
  },

  async getTestimonials(): Promise<PlatformTestimonial[]> {
    const { data } = await api.get<TestimonialApiResponse[]>(
      "api/feedback/testimonials",
    );
    return data.map(mapTestimonial);
  },
};