// components/layout/top-bar.tsx
"use client";

import { usePathname } from "next/navigation";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/use-is-client";
import type { NavItem } from "@/types/navigation";

interface TopBarProps {
  navItems: NavItem[];
  title?: string; // override manuel, sinon dérivé de navItems + pathname
  notificationCount?: number;
  user: { name: string; initials: string; avatarUrl?: string };
  accent?: "blue" | "rose";
}

const ACCENT_RING = {
  blue: "ring-brand-blue/25",
  rose: "ring-brand-rose/25",
} as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function TopBar({ navItems, title, notificationCount = 0, user, accent = "blue" }: TopBarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = mounted && theme === "dark";

  const displayTitle = title ?? navItems.find((item) => item.href === pathname)?.label ?? "Dashboard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-base font-semibold text-foreground">{displayTitle}</h1>

      <div className="flex items-center gap-3">
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
          className={`flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className={`h-8 w-8 rounded-full object-cover ring-2 ${ACCENT_RING[accent]}`}
          />
        ) : (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white ring-2 ${ACCENT_RING[accent]}`}
          >
            {user.initials}
          </div>
        )}
      </div>
    </header>
  );
}