import { MoreHorizontal } from "lucide-react";
import { MemberRoleBadge } from "./MemberRoleBadge";
import type { MemberRole } from "../../../types/workspaceTypes";

type Props = {
  name: string;
  initials: string;
  role: MemberRole;
  title: string;
  email: string;
  avatarAccent: "rose" | "navy" | "blue" | "muted";
  onMenuClick?: () => void;
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
  onMenuClick,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-card p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white ${ACCENT_CLASSES[avatarAccent]}`}
        >
          {initials}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <MemberRoleBadge role={role} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{title}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{email}</span>
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}