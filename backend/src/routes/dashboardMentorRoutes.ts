import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/authMiddleware";
import {
  getMentorDashboardStatsHandler,
  getMentorMenteeProgressHandler,
  getMentorSessionsActivityHandler,
  getMentorUpcomingSessionsHandler,
  getRecentFeedbacks
} from "../controllers/dashboardMentorController";

const router = Router();

router.get("/stats", requireAuth, requireRole("MENTOR"), getMentorDashboardStatsHandler);
router.get("/mentees-progress", requireAuth, requireRole("MENTOR"), getMentorMenteeProgressHandler);
router.get("/sessions-activity", requireAuth, requireRole("MENTOR"), getMentorSessionsActivityHandler);
router.get("/upcoming-sessions", requireAuth, requireRole("MENTOR"), getMentorUpcomingSessionsHandler);
router.get("/recent-feedbacks", requireAuth, requireRole("MENTOR"), getRecentFeedbacks);

export default router;