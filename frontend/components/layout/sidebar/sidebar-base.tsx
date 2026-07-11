"use client";

import { useIsClient } from "@/hooks/use-is-client";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { authApi } from "@/features/auth/api/authAPI";
import { toast } from "sonner";
import type { NavItem } from "@/types/navigation";
import { Logo } from "@/components/ui/Logo";




export type SidebarRole = "entrepreneur" | "mentor";

interface SidebarUser {
  name: string;
  roleLabel: string;
  initials: string;
  avatarUrl?: string;
}

interface SidebarBaseProps {
  role: SidebarRole;
  navItems: NavItem[];
  user: SidebarUser;
}

const ACCENT = {
  entrepreneur: {
    activeBg: "bg-gradient-brand",
    hover: "hover:bg-brand-blue/8 hover:text-brand-blue",
    avatar: "bg-brand-blue",
    logo: "text-brand-blue",
  },
  mentor: {
    activeBg: "bg-gradient-brand",
    hover: "hover:bg-brand-rose/8 hover:text-brand-rose",
    avatar: "bg-brand-rose",
    logo: "text-brand-rose",
  },
} as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function SidebarBase({ role, navItems, user }: SidebarBaseProps) {
  const pathname = usePathname();

  const { theme, setTheme } = useTheme();

  const mounted = useIsClient();

  const accent = ACCENT[role];
  const isDark = mounted && theme === "dark";

  const handleLogout = async () => {
  try {
    await authApi.logout();
    window.location.href = "/";
  } catch {
    toast.error("Erreur lors de la déconnexion");
  }
};

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card px-3 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 pb-6">
      <Logo/>
        
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${FOCUS_RING} ${
                isActive
                  ? "text-white"
                  : `text-muted-foreground ${accent.hover}`
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={`sidebar-active-pill-${role}`}
                  className={`absolute inset-0 rounded-lg ${accent.activeBg}`}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative z-10 flex flex-1 items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="flex-1 truncate">{item.label}</span>
                {!!item.badge && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-rose px-1 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
            </NextLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Mode {isDark ? "Clair" : "Sombre"}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-rose transition-colors hover:bg-brand-rose/8 ${FOCUS_RING}`}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${accent.avatar}`}
            >
              {user.initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.roleLabel}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
