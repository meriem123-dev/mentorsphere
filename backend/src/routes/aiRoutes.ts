import { Router } from "express";
import {
  getAISummary,
  getMentorMatches,
  generateAISummaryHandler,
  generateMentorMatchesHandler,
  getSwotAnalysis,
  generateSwotAnalysisHandler,
  getAIChat,
  sendAIChatMessageHandler,
  generateMentorBriefingHandler,
  getMentorBriefing,
} from "../controllers/aiController";
import { requireAuth } from "../middlewares/authMiddleware";


const router = Router();

// Résumé IA
router.get("/:mentorshipId/ai-summary", requireAuth, getAISummary);
router.post(
  "/:mentorshipId/ai-summary/generate",
  requireAuth,
  generateAISummaryHandler,
);

// Recommandations mentors
router.get("/:mentorshipId/mentor-matches", requireAuth, getMentorMatches);
router.post(
  "/:mentorshipId/mentor-matches/generate",
  requireAuth,
  generateMentorMatchesHandler,
);

router.get("/:mentorshipId/swot", requireAuth, getSwotAnalysis);
router.post(
  "/:mentorshipId/swot/generate",
  requireAuth,
  generateSwotAnalysisHandler,
);

router.get("/:mentorshipId/chat", requireAuth, getAIChat);
router.post("/:mentorshipId/chat/send", requireAuth, sendAIChatMessageHandler);

router.get("/:mentorshipId/mentor-briefing", requireAuth, getMentorBriefing);
router.post("/:mentorshipId/mentor-briefing/generate", requireAuth, generateMentorBriefingHandler);

export default router;
