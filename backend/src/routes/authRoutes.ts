import { Router } from "express";
import { AuthController } from "../controllers/authControlller.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", requireAuth, AuthController.me);

router.patch("/password", requireAuth, AuthController.updatePassword);
router.patch("/email", requireAuth, AuthController.updateEmail);

router.get("/verify-email/:token", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerification);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.post("/google", AuthController.googleAuth);

export default router;