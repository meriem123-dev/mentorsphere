import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { getWorkspaceOverviewHandler,getWorkspaceSummariesHandler } from "../controllers/workspaceController";

const router = Router();

router.get("/summaries", requireAuth, getWorkspaceSummariesHandler);
router.get("/:id/overview", requireAuth, getWorkspaceOverviewHandler);

export default router;