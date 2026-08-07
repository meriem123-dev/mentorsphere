import { Crown, CircleDot, Pencil } from "lucide-react";
import type { MemberRole } from "../../../types/workspaceTypes";

const ROLE_CONFIG: Record<MemberRole, { icon: typeof Crown; label: string; className: string }> = {
  owner: { icon: Crown, label: "Owner", className: "bg-brand-blue/10 text-brand-blue" },
  mentor: { icon: CircleDot, label: "Mentor", className: "bg-brand-rose/10 text-brand-rose" },
  collaborator: { icon: Pencil, label: "Collaborator", className: "bg-emerald-500/10 text-emerald-600" },
};

export function MemberRoleBadge({ role }: { role: MemberRole }) {
  const { icon: Icon, label, className } = ROLE_CONFIG[role];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}