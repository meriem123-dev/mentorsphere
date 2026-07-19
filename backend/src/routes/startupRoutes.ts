import { Router } from "express";
import { StartupController } from "../controllers/startupController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", requireAuth, requireRole("ENTREPRENEUR"), StartupController.createStartup);
router.get("/mine", requireAuth, requireRole("ENTREPRENEUR"), StartupController.getMyStartups);
router.get("/public", requireAuth, StartupController.getPublicStartups);
router.get(
  "/requests/received",
  requireAuth,
  requireRole("ENTREPRENEUR"),
  StartupController.getReceivedJoinRequests,
);
router.patch(
  "/requests/:requestId/respond",
  requireAuth,
  requireRole("ENTREPRENEUR"),
  StartupController.respondToJoinRequest,
);
router.post("/:id/join", requireAuth, StartupController.createJoinRequest);
router.get("/:id", requireAuth, StartupController.getStartupById);
router.patch("/:id", requireAuth, requireRole("ENTREPRENEUR"), StartupController.updateStartup);
router.delete("/:id", requireAuth, requireRole("ENTREPRENEUR"), StartupController.deleteStartup);

export default router;