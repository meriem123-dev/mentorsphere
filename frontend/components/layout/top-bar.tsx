"use client";

import { usePathname } from "next/navigation";
import { Bell, Moon, Sun, Menu, Home } from "lucide-react";
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
  user: { name: string; initials: string; avatarUrl?: string; avatarColor?: string };
  accent?: "blue" | "rose";
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function TopBar({ navItems, title, notificationCount = 0, user, accent = "blue" }: TopBarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = mounted && theme === "dark";
  const { toggle } = useSidebarMobile();
  const handleLogout = useLogout();

  const displayTitle = title ?? navItems.find((item) => item.href === pathname)?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-card/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label="Ouvrir le menu"
          className={`flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden ${FOCUS_RING}`}
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="truncate text-base font-semibold text-foreground">{displayTitle}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className={`relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-rose ring-2 ring-card" />
          )}
        </button>

        <button
          type="button"
          aria-label="Changer de thème"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex ${FOCUS_RING}`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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