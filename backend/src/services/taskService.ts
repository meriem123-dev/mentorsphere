import prisma from "../lib/prisma";

const TASK_PRIORITIES = ["high", "medium", "low"] as const;
const TASK_STATUSES = ["todo", "done"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export function isValidPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && TASK_PRIORITIES.includes(value as TaskPriority);
}

export function isValidStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && TASK_STATUSES.includes(value as TaskStatus);
}

type CreateTaskInput = {
  title: string;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: Date;
};

type UpdateTaskInput = Partial<{
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
  dueDate: Date;
}>;

export const taskService = {
  async listByMentorship(mentorshipId: string) {
    return prisma.task.findMany({
      where: { mentorshipId },
      orderBy: { createdAt: "asc" },
    });
  },

  //métier créer une tache
  async create(mentorshipId: string, input: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: input.title,
        priority: input.priority,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate,
        mentorshipId,
      },
    });
  },

  //métier récup tache par id
  async findById(mentorshipId: string, taskId: string) {
    return prisma.task.findFirst({
      where: { id: taskId, mentorshipId },
    });
  },

  //métier maj
  async update(mentorshipId: string, taskId: string, input: UpdateTaskInput) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, mentorshipId },
    });
    if (!existing) return null;

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
        ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      },
    });
  },

  //métier supp
  async delete(mentorshipId: string, taskId: string) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, mentorshipId },
    });
    if (!existing) return null;

    await prisma.task.delete({ where: { id: taskId } });
    return existing;
  },

  //métier verif si l'assignee appartient au mentorship
async assigneeBelongsToMentorship(mentorshipId: string, assigneeId: string) {
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    include: {
      mentor: { select: { userId: true } },
      entrepreneur: { select: { userId: true } },
      startup: {
        include: {
          joinRequests: {
            where: { status: "ACCEPTED" },
            include: { requester: { select: { userId: true } } },
          },
        },
      },
    },
  });
  if (!mentorship) return false;

  if (mentorship.mentor?.userId === assigneeId) return true;
  if (mentorship.entrepreneur?.userId === assigneeId) return true;

  return (
    mentorship.startup?.joinRequests.some(
      (jr) => jr.requester.userId === assigneeId,
    ) ?? false
  );
},
}