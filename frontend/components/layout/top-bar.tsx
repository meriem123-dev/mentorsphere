"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, Home } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/use-is-client";
import type { NavItem } from "@/types/navigation";
import { UserMenu } from "@/components/layout/user-menu";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useSidebarMobile } from "./sidebar/sidebar-mobile-context";

interface TopBarProps {
  navItems: NavItem[];
  title?: string;
  notificationCount?: number;
  user: {
    name: string;
    initials: string;
    avatarUrl?: string;
    avatarColor?: string;
  };
  accent?: "blue" | "rose";
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function TopBar({
  navItems,
  title,
  user,
}: TopBarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = mounted && theme === "dark";
  const { toggle } = useSidebarMobile();
  const handleLogout = useLogout();

  const displayTitle =
    title ??
    [...navItems]
      .sort((a, b) => b.href.length - a.href.length)
      .find(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      )?.label ??
    "Dashboard";

  return (
    <header className="sticky rounded-2xl ml-2 top-0 z-30 shadow-sidebar-glow flex h-16 items-center justify-between border border-white/10 bg-card/60 px-4 backdrop-blur-md supports-backdrop-filter:bg-card/40 sm:px-6 ">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label="Ouvrir le menu"
          className={`flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden ${FOCUS_RING}`}
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="truncate text-base font-semibold text-foreground">
          {displayTitle}
        </h1>
      </div>

      <div className="flex items-center gap-0 sm:gap-6">
        <button
          type="button"
          aria-label="Notifications"
          className={`relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
        ></button>

        <button
          type="button"
          aria-label="Changer de thème"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex ${FOCUS_RING}`}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <UserMenu
          name={user.name}
          initials={user.initials}
          avatarUrl={user.avatarUrl}
          avatarColor={user.avatarColor}
          primaryAction={{ label: "Retour au site", href: "/", icon: Home }}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
}
