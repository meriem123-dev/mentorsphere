export interface MentorToRate {
  mentorId: string;
  mentorshipId: string;
  startupName: string | null;
  name: string;
  title: string;
  initials: string;
  avatarUrl?: string;
  averageRating: number;
  reviewsCount: number;
  myRating: number | null;
  myComment: string | null;
}

export interface PlatformTestimonial {
  id: string;
  author: string;
  date: string;
  rating: number;
  quote: string;
  initials: string;
}

export interface PlatformReview {
  id: string;
  rating: number;
  comment: string | null;
}

export interface PlatformReviewPayload {
  rating: number;
  comment?: string;
}