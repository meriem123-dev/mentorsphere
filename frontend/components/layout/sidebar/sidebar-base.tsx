"use client";

import { useEffect } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, LogOut, X } from "lucide-react";
import { useTheme } from "next-themes";
import { authApi } from "@/features/auth/api/authAPI";
import { toast } from "sonner";
import type { NavItem } from "@/types/navigation";
import { Logo } from "@/components/ui/Logo";
import { useSidebarMobile } from "./sidebar-mobile-context";
import { useNavBadges } from "@/features/auth/hooks/use-nav-badges";

export type SidebarRole = "entrepreneur" | "mentor";

interface SidebarUser {
  name: string;
  roleLabel: string;
  initials: string;
  avatarUrl?: string;
  avatarColor?: string;
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
  const { isOpen, close } = useSidebarMobile();

  const accent = ACCENT[role];
  const isDark = mounted && theme === "dark";

  const badgeCounts = useNavBadges();

  const resolvedBadge = (item: NavItem) =>
    item.badgeKey ? badgeCounts[item.badgeKey] : item.badge;

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      window.location.href = "/";
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const renderNav = () => (
    <nav className="flex flex-1 flex-col gap-1 overflow-hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <NextLink
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${FOCUS_RING} ${
              isActive ? "text-white" : `text-muted-foreground ${accent.hover}`
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={`sidebar-active-pill-${role}`}
                className={`absolute inset-0 rounded-xl ${accent.activeBg} shadow-sm shadow-black/10`}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}

            <span className="relative z-10 flex flex-1 items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="flex-1 truncate">{item.label}</span>
              {!!resolvedBadge(item) && (
                <span
                  className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-brand-rose text-white"
                  }`}
                >
                  {resolvedBadge(item)}
                </span>
              )}
            </span>
          </NextLink>
        );
      })}
    </nav>
  );

  const renderFooter = () => (
    <div className="space-y-1 border-t border-border pt-1">
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        Mode {isDark ? "Clair" : "Sombre"}
      </button>

      <button
        type="button"
        onClick={handleLogout}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-brand-rose transition-colors hover:bg-brand-rose/8 ${FOCUS_RING}`}
      >
        <LogOut className="h-4 w-4" />
        Déconnexion
      </button>

      <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-border ${user.avatarColor ?? accent.avatar}`}
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
  );

  return (
    <>
      {/* Backdrop mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-brand-navy/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* MOBILE SIDEBAR - Drawer overlay */}
      <aside
        role="dialog"
        aria-modal={isOpen}
        aria-label="Menu de navigation"
        className={`fixed rounded-3xl inset-y-0 left-0 z-50 flex h-full w-1/2 -translate-x-full flex-col border-r border-border bg-card px-3 py-3 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between px-1 pb-4">
          <Logo compact />
          <button
            type="button"
            onClick={close}
            aria-label="Fermer le menu"
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {renderNav()}
        {renderFooter()}
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside
        role="navigation"
        aria-label="Menu de navigation"
        className="hidden h-screen w-1/6 flex-col border-r border-border bg-card px-3 py-3 lg:flex rounded-3xl"
      >
        <div className="px-1 pb-3">
          <Logo />
        </div>

        {renderNav()}
        {renderFooter()}
      </aside>
    </>
  );
}
