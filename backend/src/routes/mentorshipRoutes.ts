import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authMiddleware";
import * as mentorController from "../controllers/mentorController";
import * as mentorshipController from "../controllers/mentorshipController";

const router = Router();


router.get("/mentors", mentorController.getMentors);
router.get("/mentors/:id", mentorController.getMentorById);


router.post(
  "/",
  requireAuth,
  requireRole("ENTREPRENEUR"),
  mentorshipController.createMentorshipRequest,
);


router.get(
  "/received",
  requireAuth,
  requireRole("MENTOR"),
  mentorshipController.getReceivedRequests,
);


router.get(
  "/sent",
  requireAuth,
  requireRole("ENTREPRENEUR"),
  mentorshipController.getSentRequests,
);


router.patch(
  "/:id/respond",
  requireAuth,
  requireRole("MENTOR"),
  mentorshipController.respondToRequest,
);

export default router;