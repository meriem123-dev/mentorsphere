import { Request, Response } from "express";
import * as feedbackService from "../services/feedbackService";

const ERROR_STATUS: Record<string, number> = {
  ENTREPRENEUR_NOT_FOUND: 404,
  MENTORSHIP_NOT_FOUND: 404,
  INVALID_RATING: 400,
};

function handleError(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
  const status = ERROR_STATUS[message] ?? 500;
  res.status(status).json({ error: message });
}

//recup mentors
export const getMentorsToRate = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId; // ajuste selon le typing de ton middleware d'auth
    const mentors = await feedbackService.getMentorsToRate(userId);
    res.json(mentors);
  } catch (err) {
    handleError(res, err);
  }
};

//noter
export const rateMentor = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { mentorshipId } = req.params;
    const { rating, comment } = req.body;

    if (!mentorshipId || Array.isArray(mentorshipId)) {
      return res.status(400).json({ error: "MENTORSHIP_ID_REQUIRED" });
    }

    const review = await feedbackService.rateMentor({
      userId,
      mentorshipId,
      rating,
      comment,
    });

    res.json(review);
  } catch (err) {
    handleError(res, err);
  }
};

//feedback plateforme
export const getMyPlatformReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const review = await feedbackService.getMyPlatformReview(userId);
    res.json(review);
  } catch (err) {
    handleError(res, err);
  }
};

//envoyer feedback
export const submitPlatformReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { rating, comment } = req.body;
    const review = await feedbackService.submitPlatformReview({
      userId,
      rating,
      comment,
    });
    res.json(review);
  } catch (err) {
    handleError(res, err);
  }
};

//recup feedbacks
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const testimonials = await feedbackService.getTestimonials(limit);
    res.json(testimonials);
  } catch (err) {
    handleError(res, err);
  }
};