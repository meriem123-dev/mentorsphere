import { Router } from "express";
import { StartupController } from "../controllers/startupController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", requireAuth, requireRole("ENTREPRENEUR"), StartupController.createStartup);
router.get("/mine", requireAuth, requireRole("ENTREPRENEUR"), StartupController.getMyStartups);
router.patch("/:id", requireAuth, requireRole("ENTREPRENEUR"), StartupController.updateStartup);
router.delete("/:id", requireAuth, requireRole("ENTREPRENEUR"), StartupController.deleteStartup);

export default router;