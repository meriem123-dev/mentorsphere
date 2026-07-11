import { SidebarBase } from "./sidebar-base";
import { mentorNavItems } from "@/lib/navigation-config";

interface MentorSidebarProps {
  user: { name: string; initials: string; avatarUrl?: string };

}

export function MentorSidebar({ user }: MentorSidebarProps) {
  return (
    <SidebarBase
      role="mentor"
      navItems={mentorNavItems}
      user={{ ...user, roleLabel: "Mentor" }}

    />
  );
}