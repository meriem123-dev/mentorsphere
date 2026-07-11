import { SidebarBase } from "./sidebar-base";
import { entrepreneurNavItems } from "@/lib/navigation-config";

interface EntrepreneurSidebarProps {
  user: { name: string; initials: string; avatarUrl?: string };

}

export function EntrepreneurSidebar({ user }: EntrepreneurSidebarProps) {
  return (
    <SidebarBase
      role="entrepreneur"
      navItems={entrepreneurNavItems}
      user={{ ...user, roleLabel: "Entrepreneur" }}

    />
  );
}