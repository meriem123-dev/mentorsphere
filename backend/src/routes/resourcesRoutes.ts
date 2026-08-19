import { Router } from "express";
import {
  createResourceHandler,
  listResourcesHandler,
  getResourceHandler,
  deleteResourceHandler,
  toggleSaveResourceHandler,
} from "../controllers/resourcesController";
import { uploadResourceFile } from "../middlewares/upload";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", listResourcesHandler);
router.get("/:id", getResourceHandler);
router.post("/", uploadResourceFile, createResourceHandler);
router.post("/:id/save", toggleSaveResourceHandler);
router.delete("/:id", deleteResourceHandler);

export default router;