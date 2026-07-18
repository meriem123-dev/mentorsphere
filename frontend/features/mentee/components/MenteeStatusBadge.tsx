import type { MenteeStatus } from "../../../types/mentoratTypes";

interface MenteeStatusBadgeProps {
  status: MenteeStatus;
}

export function MenteeStatusBadge({ status }: MenteeStatusBadgeProps) {
  const isActive = status === "actif";

  return (
    <span
      className={
        isActive
          ? "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
          : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
      }
    >
      <span
        className={
          isActive
            ? "h-1.5 w-1.5 rounded-full bg-success"
            : "h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
        }
        aria-hidden
      />
      {isActive ? "Actif" : "Inactif"}
    </span>
  );
}