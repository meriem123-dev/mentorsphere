interface UserAvatarProps {
  user: { name: string; initials: string; avatarUrl?: string };
  accent?: "blue" | "rose";
  size?: "sm" | "md" | "lg";
}

const ACCENT_RING = {
  blue: "ring-brand-blue/25",
  rose: "ring-brand-rose/25",
} as const;

const SIZE = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

export function UserAvatar({ user, accent = "blue", size = "md" }: UserAvatarProps) {
  const dimensions = SIZE[size];
  const ring = ACCENT_RING[accent];

  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={`${dimensions} rounded-full object-cover ring-2 ${ring}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-brand-navy font-semibold text-white ring-2 ${dimensions} ${ring}`}
    >
      {user.initials}
    </div>
  );
}