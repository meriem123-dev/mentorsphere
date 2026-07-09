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

export default router;