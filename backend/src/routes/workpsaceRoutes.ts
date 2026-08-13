import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { getWorkspaceOverviewHandler,getWorkspaceSummariesHandler,getWorkspaceMessagesHandler } from "../controllers/workspaceController";
import {createObjectiveHandler,listObjectivesHandler,updateObjectiveHandler,deleteObjectiveHandler} from "../controllers/objectiveController";
import { listDocumentsHandler, uploadDocumentHandler, deleteDocumentHandler } from "../controllers/documentController";
import {createSessionHandler,listSessionsHandler,getSessionByIdHandler,updateSessionNotesHandler,updateSessionStatusHandler,getSessionRoomCredentialsHandler,cancelSessionHandler,deleteSessionHandler,rescheduleSessionHandler, getDueRemindersHandler} from "../controllers/sessionController"

import multer from "multer";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router();

router.get("/summaries", requireAuth, getWorkspaceSummariesHandler);
router.get("/:id/overview", requireAuth, getWorkspaceOverviewHandler);
router.get("/:id/messages", requireAuth, getWorkspaceMessagesHandler);

router.get("/:id/objectives", requireAuth, listObjectivesHandler);
router.post("/:id/objectives",requireAuth, createObjectiveHandler);
router.patch("/:id/objectives/:objectiveId",requireAuth, updateObjectiveHandler);
router.delete("/:id/objectives/:objectiveId",requireAuth, deleteObjectiveHandler);

router.get("/:id/documents",requireAuth, listDocumentsHandler);
router.post("/:id/documents",requireAuth, upload.single("file"), uploadDocumentHandler);
router.delete("/:id/documents/:documentId",requireAuth, deleteDocumentHandler);

router.get("/:mentorshipId/sessions", requireAuth, listSessionsHandler);
router.post("/:mentorshipId/sessions", requireAuth, createSessionHandler);
router.patch("/:mentorshipId/sessions/:sessionId/status", requireAuth, updateSessionStatusHandler);
router.patch("/:mentorshipId/sessions/:sessionId/notes", requireAuth, updateSessionNotesHandler);
router.patch("/:mentorshipId/sessions/:sessionId/reschedule", requireAuth, rescheduleSessionHandler);
router.patch("/:mentorshipId/sessions/:sessionId/cancel", requireAuth, cancelSessionHandler);
router.delete("/:mentorshipId/sessions/:sessionId", requireAuth, deleteSessionHandler);
router.get("/:mentorshipId/sessions/:sessionId", requireAuth, getSessionByIdHandler);
router.get("/:mentorshipId/sessions/:sessionId/room",requireAuth,getSessionRoomCredentialsHandler);
router.get("/internal/reminders-due", getDueRemindersHandler);

export default router;