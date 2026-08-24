const AVATAR_COLORS = [
  "bg-brand-blue",
  "bg-brand-rose",
  "bg-brand-navy",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-cyan-600",
  "bg-pink-500",
];

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0) ?? "";
  const last = lastName.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
}

export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}