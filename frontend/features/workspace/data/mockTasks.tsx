import type { Task } from "@/types/workspaceTypes";


export const MOCK_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Mettre à jour la section GTM du pitch deck",
    status: "todo",
    priority: "high",
    assigneeId: "user-elena",
    dueDate: "2026-07-28",
  },
  {
    id: "task-2",
    title: "Rechercher les benchmarks CAC pour le B2B SaaS",
    status: "todo",
    priority: "high",
    assigneeId: "user-elena",
    dueDate: "2026-07-29",
  },
  {
    id: "task-3",
    title: "Revoir la version mise à jour du pitch deck",
    status: "todo",
    priority: "medium",
    assigneeId: "user-sarah",
    dueDate: "2026-07-30",
  },
  {
    id: "task-4",
    title: "Préparer la liste de prospection investisseurs",
    status: "todo",
    priority: "medium",
    assigneeId: "user-elena",
    dueDate: "2026-08-01",
  },
  {
    id: "task-5",
    title: "Configurer le CRM pour le suivi des investisseurs",
    status: "done",
    priority: "low",
    assigneeId: "user-elena",
    dueDate: "2026-08-05",
  },
  {
    id: "task-6",
    title: "Envoyer les introductions chaleureuses aux VCs",
    status: "todo",
    priority: "high",
    assigneeId: "user-sarah",
    dueDate: "2026-08-31",
  },
];

// À remplacer é
export const MOCK_MEMBERS = [
  {
    id: "member-1",
    userId: "user-elena",
    name: "Elena K.",
    initials: "EK",
    role: "collaborator" as const,
    title: "Co-fondatrice",
    email: "elena@example.com",
    avatarAccent: "rose" as const,
  },
  {
    id: "member-2",
    userId: "user-sarah",
    name: "Sarah C.",
    initials: "SC",
    role: "collaborator" as const,
    title: "Co-fondatrice",
    email: "sarah@example.com",
    avatarAccent: "navy" as const,
  },
];