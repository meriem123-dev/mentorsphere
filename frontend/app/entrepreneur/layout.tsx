// app/entrepreneur/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { EntrepreneurSidebar } from "@/components/layout/sidebar/entrepreneur-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { getFullName, getInitials, getAvatarUrl,getAvatarColor } from "@/lib/user-display";
import { entrepreneurNavItems } from "@/lib/navigation-config";
import { SidebarMobileProvider } from "@/components/layout/sidebar/sidebar-mobile-context";


export default function EntrepreneurLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "ENTREPRENEUR") {
      router.replace(`/${user.role.toLowerCase()}/dashboard`);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "ENTREPRENEUR") {
    return null;
  }

  const displayUser = {
    name: getFullName(user),
    initials: getInitials(user),
    avatarUrl: getAvatarUrl(user),
    avatarColor: getAvatarColor(user),
  };

  return (
    <SidebarMobileProvider>
    <div className="flex h-screen overflow-hidden">
      <EntrepreneurSidebar user={displayUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar user={displayUser} accent="blue" navItems={entrepreneurNavItems} />
        <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
    </SidebarMobileProvider>
  );
}