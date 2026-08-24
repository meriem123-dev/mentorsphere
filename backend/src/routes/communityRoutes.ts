import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import {
  listPostsHandler,
  createPostHandler,
  toggleLikeHandler,
  toggleSaveHandler,
  createCommentHandler,
  listCommentsHandler
} from "../controllers/communityController";

const router = Router();

router.use(requireAuth);

router.get("/posts",requireAuth, listPostsHandler);
router.post("/posts",requireAuth, createPostHandler);
router.post("/posts/:postId/like",requireAuth, toggleLikeHandler);
router.post("/posts/:postId/save",requireAuth, toggleSaveHandler);
router.get("/posts/:postId/comments", listCommentsHandler);
router.post("/posts/:postId/comments", createCommentHandler);

export default router;