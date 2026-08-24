interface AvatarProps {
  avatarUrl?: string | null;
  avatarColor?: string;
  initials: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-10 w-10 text-sm",
};

export function Avatar({
  avatarUrl,
  avatarColor,
  initials,
  alt,
  size = "md",
}: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={alt ?? initials}
        className={`shrink-0 rounded-full object-cover ${sizeClass}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${
        avatarColor ?? "bg-brand-navy"
      } ${sizeClass}`}
    >
      {initials}
    </div>
  );
}