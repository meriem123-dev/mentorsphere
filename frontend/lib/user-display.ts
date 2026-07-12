import type { User } from "@/types/authTypes";

const DEFAULT_AVATAR_COLOR = "bg-brand-blue";

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

// coverPicture est réutilisé pour stocker une classe Tailwind (ex: "bg-brand-rose")
// quand l'utilisateur a choisi une couleur plutôt qu'une photo de profil.
export function getAvatarColor(user: User): string {
  return user.coverPicture ?? DEFAULT_AVATAR_COLOR;
}