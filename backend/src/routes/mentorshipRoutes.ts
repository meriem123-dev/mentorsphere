import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authMiddleware";
import * as mentorController from "../controllers/mentorController";
import * as mentorshipController from "../controllers/mentorshipController";
import * as EntrepreneurController from "../controllers/entrepreneurController"

const router = Router();


router.get("/mentors",requireAuth, mentorController.getMentors);
router.get("/entrepreneurs",requireAuth, EntrepreneurController.getEntrepreneurs);
router.get(
  "/mentees",
  requireAuth,
  requireRole("MENTOR"),
  mentorshipController.getMentees,
);
router.get("/entrepreneurs/:id",requireAuth, EntrepreneurController.getEntrepreneurById);
router.get("/mentors/:id",requireAuth, mentorController.getMentorById);


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