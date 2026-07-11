
import type { User } from "@/types/authTypes";

export function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getInitials(user: User): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function getAvatarUrl(user: User): string | undefined {
  return user.profilePicture ?? undefined;
}