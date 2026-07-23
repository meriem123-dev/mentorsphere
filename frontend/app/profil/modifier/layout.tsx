"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { EntrepreneurSidebar } from "@/components/layout/sidebar/entrepreneur-sidebar";
import { MentorSidebar } from "@/components/layout/sidebar/mentor-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { getFullName, getInitials, getAvatarUrl, getAvatarColor } from "@/lib/user-display";
import { entrepreneurNavItems, mentorNavItems } from "@/lib/navigation-config";
import { SidebarMobileProvider } from "@/components/layout/sidebar/sidebar-mobile-context";

export default function ProfilModifierLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  const isMentor = user.role === "MENTOR";

  const displayUser = {
    name: getFullName(user),
    initials: getInitials(user),
    avatarUrl: getAvatarUrl(user),
    avatarColor: getAvatarColor(user),
  };

  const navItems = isMentor ? mentorNavItems : entrepreneurNavItems;

  return (
    <SidebarMobileProvider>
      <div className="flex h-screen overflow-hidden">
        {isMentor ? (
          <MentorSidebar user={displayUser} />
        ) : (
          <EntrepreneurSidebar user={displayUser} />
        )}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            user={displayUser}
            accent={isMentor ? "rose" : "blue"}
            navItems={navItems}
            title="Modifier mon profil"
          />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarMobileProvider>
  );
}