import { Router } from "express";
import { getStats, getTestimonialsList } from "../controllers/publicController";

const router = Router();


router.get("/stats", getStats);
router.get("/testimonials", getTestimonialsList);

export default router;