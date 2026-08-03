import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { getWorkspaceOverviewHandler,getWorkspaceSummariesHandler,getWorkspaceMessagesHandler } from "../controllers/workspaceController";

const router = Router();

router.get("/summaries", requireAuth, getWorkspaceSummariesHandler);
router.get("/:id/overview", requireAuth, getWorkspaceOverviewHandler);
router.get("/:id/messages", requireAuth, getWorkspaceMessagesHandler);

export default router;