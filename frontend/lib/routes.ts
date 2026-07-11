import type { User } from "@/types/authTypes";

export function getDashboardPath(role: User["role"]): string {
  switch (role) {
    case "MENTOR":
      return "/mentor/dashboard";
    case "ENTREPRENEUR":
      return "/entrepreneur/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
  }
}

export function getProfileCompletionPath(role: User["role"]): string {
  switch (role) {
    case "MENTOR":
      return "/auth/ProfileCompletion/Mentor";
    case "ENTREPRENEUR":
      return "/auth/ProfileCompletion/Entrepreneur";
    case "ADMIN":
      return "/admin/dashboard"; // un admin ne complète pas de profil
  }
}