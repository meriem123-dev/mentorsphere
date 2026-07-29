import { UserPlus } from "lucide-react";
import { MemberListItem } from "./MemberListItem";
import type { WorkspaceMember } from "../../../types/workspaceTypes";

type Props = {
  members: WorkspaceMember[];
  onInvite: () => void;
  onMemberMenuClick?: (memberId: string) => void;
};

export function MembersTab({ members, onInvite, onMemberMenuClick }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {members.length} members
        </h3>
        <button
          onClick={onInvite}
          className="flex items-center gap-1.5 rounded-2xl bg-brand-rose px-3 py-2 text-xs font-medium text-white"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Inviter un membre
        </button>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <MemberListItem
            key={member.id}
            name={member.name}
            initials={member.initials}
            role={member.role}
            title={member.title}
            email={member.email}
            avatarAccent={member.avatarAccent}
            onMenuClick={() => onMemberMenuClick?.(member.id)}
          />
        ))}
      </div>
    </div>
  );
}