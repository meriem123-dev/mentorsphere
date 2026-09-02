import { Router } from "express";
import * as feedbackController from "../controllers/feedbackController";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authMiddleware";   

const router = Router();

router.use(requireAuth);

router.get(
  "/mentors-to-rate",
  requireRole("ENTREPRENEUR"),
  feedbackController.getMentorsToRate,
);
router.post(
  "/mentor/:mentorshipId",
  requireRole("ENTREPRENEUR"),
  feedbackController.rateMentor,
);

router.get("/platform/me", feedbackController.getMyPlatformReview);
router.post("/platform", feedbackController.submitPlatformReview);

router.get("/testimonials", feedbackController.getTestimonials);

export default router;