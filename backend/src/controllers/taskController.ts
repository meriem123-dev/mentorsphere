import { Request, Response } from "express";
import {
  taskService,
  isValidPriority,
  isValidStatus,
} from "../services/taskService";
import { getWorkspaceAccess } from "../services/workspaceService";

function getParam(req: Request, name: string): string | undefined {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

//recups tasks
export async function listTasksHandler(req: Request, res: Response) {
  const mentorshipId = getParam(req, "mentorshipId");
  if (!mentorshipId)
    return res.status(400).json({ error: "MENTORSHIP_ID_REQUIRED" });

  const userId = req.user!.userId;
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return res.status(404).json({ error: "WORKSPACE_NOT_FOUND" });
  if (access === "FORBIDDEN")
    return res.status(403).json({ error: "FORBIDDEN" });

  try {
    const tasks = await taskService.listByMentorship(mentorshipId);
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}

//créer task
export async function createTaskHandler(req: Request, res: Response) {
  const mentorshipId = getParam(req, "mentorshipId");
  if (!mentorshipId)
    return res.status(400).json({ error: "MENTORSHIP_ID_REQUIRED" });

  const userId = req.user!.userId;
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return res.status(404).json({ error: "WORKSPACE_NOT_FOUND" });
  if (access === "FORBIDDEN")
    return res.status(403).json({ error: "FORBIDDEN" });

  const canManageSessions = access.isMentor || access.isOwner;
  if (!canManageSessions) return res.status(403).json({ error: "FORBIDDEN" });

  const { title, priority, assigneeId, dueDate } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "TITLE_REQUIRED" });
  }
  if (!isValidPriority(priority)) {
    return res.status(400).json({ error: "INVALID_PRIORITY" });
  }
  if (typeof assigneeId !== "string" || !assigneeId) {
    return res.status(400).json({ error: "ASSIGNEE_REQUIRED" });
  }
  const parsedDueDate = new Date(dueDate);
  if (Number.isNaN(parsedDueDate.getTime())) {
    return res.status(400).json({ error: "INVALID_DUE_DATE" });
  }

  const assigneeValid = await taskService.assigneeBelongsToMentorship(
    mentorshipId,
    assigneeId,
  );
  if (!assigneeValid) {
    return res.status(400).json({ error: "ASSIGNEE_NOT_IN_MENTORSHIP" });
  }

  try {
    const task = await taskService.create(mentorshipId, {
      title: title.trim(),
      priority,
      assigneeId,
      dueDate: parsedDueDate,
    });
    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}

//modifier une tache
export async function updateTaskHandler(req: Request, res: Response) {
  const mentorshipId = getParam(req, "mentorshipId");
  const taskId = getParam(req, "taskId");
  if (!mentorshipId || !taskId)
    return res.status(400).json({ error: "PARAMS_REQUIRED" });

  const userId = req.user!.userId;
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return res.status(404).json({ error: "WORKSPACE_NOT_FOUND" });
  if (access === "FORBIDDEN")
    return res.status(403).json({ error: "FORBIDDEN" });

  const canManageSessions = access.isMentor || access.isOwner;

  const { title, priority, status, assigneeId, dueDate } = req.body ?? {};

  const onlyStatusChange =
    status !== undefined &&
    title === undefined &&
    priority === undefined &&
    assigneeId === undefined &&
    dueDate === undefined;

  if (!onlyStatusChange && !canManageSessions) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }


  // il doit être l'assigné de la tâche pour pouvoir la cocher/décocher
  if (onlyStatusChange && !canManageSessions) {
    const existingTask = await taskService.findById(mentorshipId, taskId);
    if (!existingTask) return res.status(404).json({ error: "TASK_NOT_FOUND" });
    if (existingTask.assigneeId !== userId) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
  }

  if (priority !== undefined && !isValidPriority(priority)) {
    return res.status(400).json({ error: "INVALID_PRIORITY" });
  }
  if (status !== undefined && !isValidStatus(status)) {
    return res.status(400).json({ error: "INVALID_STATUS" });
  }
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "INVALID_TITLE" });
  }

  let parsedDueDate: Date | undefined;
  if (dueDate !== undefined) {
    parsedDueDate = new Date(dueDate);
    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ error: "INVALID_DUE_DATE" });
    }
  }

  if (assigneeId !== undefined) {
    const assigneeValid = await taskService.assigneeBelongsToMentorship(
      mentorshipId,
      assigneeId,
    );
    if (!assigneeValid) {
      return res.status(400).json({ error: "ASSIGNEE_NOT_IN_MENTORSHIP" });
    }
  }

try {
    const updated = await taskService.update(mentorshipId, taskId, {
      ...(title !== undefined && { title: title.trim() }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(assigneeId !== undefined && { assigneeId }),
      ...(parsedDueDate !== undefined && { dueDate: parsedDueDate }),
    });
    if (!updated) return res.status(404).json({ error: "TASK_NOT_FOUND" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}

//supp tache
export async function deleteTaskHandler(req: Request, res: Response) {
  const mentorshipId = getParam(req, "mentorshipId");
  const taskId = getParam(req, "taskId");
  if (!mentorshipId || !taskId)
    return res.status(400).json({ error: "PARAMS_REQUIRED" });

  const userId = req.user!.userId;
  const access = await getWorkspaceAccess(mentorshipId, userId);
  if (!access) return res.status(404).json({ error: "WORKSPACE_NOT_FOUND" });
  if (access === "FORBIDDEN")
    return res.status(403).json({ error: "FORBIDDEN" });

  const canManageSessions = access.isMentor || access.isOwner;
  if (!canManageSessions) return res.status(403).json({ error: "FORBIDDEN" });

  try {
    const deleted = await taskService.delete(mentorshipId, taskId);
    if (!deleted) return res.status(404).json({ error: "TASK_NOT_FOUND" });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
