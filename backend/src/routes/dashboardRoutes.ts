import { Router } from "express";
import { getDashboardStats,getParcours,getStartupsList,getWeeklyActivity,getSuggestionsState,postSuggestions,getMentorshipsList,getMentorMatchesStateController,postMentorMatches } from "../controllers/dashboardController";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/entrepreneur/stats", requireAuth,requireRole("ENTREPRENEUR"), getDashboardStats);
router.get("/entrepreneur/parcours", requireAuth, requireRole("ENTREPRENEUR"), getParcours);
router.get("/entrepreneur/startups", requireAuth, requireRole("ENTREPRENEUR"), getStartupsList);
router.get("/entrepreneur/weekly-activity", requireAuth , requireRole("ENTREPRENEUR"), getWeeklyActivity);
router.get("/entrepreneur/mentorships", requireAuth, requireRole("ENTREPRENEUR"), getMentorshipsList);
router.get("/entrepreneur/suggestions", requireAuth, requireRole("ENTREPRENEUR"), getSuggestionsState);
router.post("/entrepreneur/suggestions/generate", requireAuth, requireRole("ENTREPRENEUR"), postSuggestions);
router.get("/entrepreneur/mentor-matches", requireAuth, requireRole("ENTREPRENEUR"), getMentorMatchesStateController);
router.post("/entrepreneur/mentor-matches/generate", requireAuth, requireRole("ENTREPRENEUR"), postMentorMatches);
export default router;