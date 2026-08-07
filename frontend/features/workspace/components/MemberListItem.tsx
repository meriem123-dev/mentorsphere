import { MemberRoleBadge } from "./MemberRoleBadge";
import type { MemberRole } from "../../../types/workspaceTypes";

type Props = {
  name: string;
  initials: string;
  role: MemberRole;
  title: string;
  email: string;
  avatarAccent: "rose" | "navy" | "blue" | "muted";
};

const ACCENT_CLASSES: Record<Props["avatarAccent"], string> = {
  rose: "bg-brand-rose",
  navy: "bg-brand-navy",
  blue: "bg-brand-blue",
  muted: "bg-muted-foreground",
};

export function MemberListItem({
  name,
  initials,
  role,
  title,
  email,
  avatarAccent,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${ACCENT_CLASSES[avatarAccent]}`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <MemberRoleBadge role={role} />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{title}</p>
        </div>
      </div>

      <div className="min-w-0 pl-[52px] sm:pl-0">
        <span className="block truncate text-xs text-muted-foreground">{email}</span>
      </div>
    </div>
  );
}