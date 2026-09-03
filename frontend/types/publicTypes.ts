export interface PlatformStats {
  mentorsCount: number;
  entrepreneursCount: number;
  startupsAccompanied: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  rating: number;
}

export interface GetTestimonialsResponse {
  testimonials: Testimonial[];
}