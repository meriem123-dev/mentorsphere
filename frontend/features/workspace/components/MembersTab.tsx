
import { MemberListItem } from "./MemberListItem";
import type { WorkspaceMember } from "../../../types/workspaceTypes";

type Props = {
  members: WorkspaceMember[];
};

export function MembersTab({ members }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {members.length} members
        </h3>
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
          />
        ))}
      </div>
    </div>
  );
}