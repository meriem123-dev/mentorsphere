import { Router } from "express";
import { getAISummary,getMentorMatches } from "../controllers/aiController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/summary/:mentorshipId", requireAuth, getAISummary);

router.get("/mentor-matches/:mentorshipId", requireAuth, getMentorMatches);

export default router;