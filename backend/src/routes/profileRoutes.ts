import { Router } from "express";
import { ProfileController } from "../controllers/profileController";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import {
  uploadMentorProfileFiles,
  uploadEntrepreneurProfileFiles,
} from "../middlewares/upload";

const router = Router();

router.post(
  "/mentor/complete",
  requireAuth,
  requireRole("MENTOR"),
  uploadMentorProfileFiles,
  ProfileController.completeMentorProfile
);

router.post(
  "/entrepreneur/complete",
  requireAuth,
  requireRole("ENTREPRENEUR"),
  uploadEntrepreneurProfileFiles,
  ProfileController.completeEntrepreneurProfile
);

router.patch(
  "/mentor",
  requireAuth,
  requireRole("MENTOR"),
  uploadMentorProfileFiles,
  ProfileController.updateMentorProfile
);

router.patch(
  "/entrepreneur",
  requireAuth,
  requireRole("ENTREPRENEUR"),
  uploadEntrepreneurProfileFiles,
  ProfileController.updateEntrepreneurProfile
);


router.get("/me", requireAuth, ProfileController.getMyProfile);

export default router;