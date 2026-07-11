"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ArrowUpRight,
  Home,
  Sparkles,
  Route,
  Quote,
  HelpCircle,
  Rocket,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/features/auth/api/authAPI";
import { toast } from "sonner";

const ThemeToggle = dynamic(
  () => import("@/components/ui/ThemeToggle").then((mod) => mod.ThemeToggle),
  { ssr: false },
);

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navLinks: NavLink[] = [
  { label: "Accueil", href: "#acceuil", icon: Home },
  { label: "Fonctionnalités", href: "#features", icon: Sparkles },
  { label: "Étapes", href: "#how", icon: Route },
  { label: "Témoignages", href: "#testimo", icon: Quote },
  { label: "FAQ", href: "#faq", icon: HelpCircle },
  { label: "CTA", href: "#cta", icon: Rocket },
];

const scrimVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.05 } },
};

const drawerVariants: Variants = {
  hidden: { x: "100%" },
  show: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 34,
      when: "beforeChildren",
      staggerChildren: 0.045,
      delayChildren: 0.08,
    },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1], when: "afterChildren" },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: 8, transition: { duration: 0.12 } },
};

//gère scroll
const scrollToSection = (id: string) => {
  const element = document.querySelector(id);

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

//le composant
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, isLoading, refetch } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  //gérer déconnexion depuis la navbar
  const handleLogout = async () => {
    try {
      await authApi.logout();
      await refetch();
      toast.success("Déconnexion réussie");
      setIsOpen(false);
      router.push("/");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Bandeau header  */}
      <div className="relative z-50 w-full bg-background/70 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="block md:hidden">
              <Logo compact />
            </div>
            <div className="hidden md:block">
              <Logo />
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-colors
                           after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:rounded-full
                           after:bg-gradient-to-r after:from-brand-blue after:to-brand-rose
                           after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <div className="w-px h-5 bg-border mx-1" />
            {!isLoading && user ? (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full gap-1"
                onClick={handleLogout}
              >
                Déconnexion
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  nativeButton={false}
                  render={(props) => (
                    <NextLink href="/auth/login" {...props}>
                      {props.children}
                    </NextLink>
                  )}
                >
                  Connexion
                </Button>
                <Button
                  size="sm"
                  className="bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground rounded-full shadow-sm shadow-brand-blue/20 gap-1"
                  nativeButton={false}
                  render={(props) => (
                    <NextLink href="/auth/Registration" {...props}>
                      {props.children}
                    </NextLink>
                  )}
                >
                  S&apos;inscrire
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <motion.button
              onClick={() => setIsOpen((s) => !s)}
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isOpen}
              className="relative p-2 rounded-full hover:bg-muted active:scale-90 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? "close" : "open"}
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  {isOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Scrim + drawer mobile — sous le header (z-50), donc logo/hamburger/toggle restent visibles */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              key="scrim"
              aria-label="Fermer le menu"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={scrimVariants}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30 bg-brand-navy/40 backdrop-blur-[2px] md:hidden"
            />
            <motion.div
              key="drawer"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={drawerVariants}
              className="fixed inset-y-0 right-0 z-40 w-[86%] max-w-[340px] md:hidden"
            >
              <div className="relative h-full overflow-hidden bg-card border-l border-border shadow-2xl flex flex-col">
                {/* Signature : voile dégradé de marque en coin */}
                <div
                  className="pointer-events-none absolute -top-16 -right-20 w-64 h-64 rounded-full blur-3xl opacity-25"
                  style={{ backgroundImage: "var(--gradient-brand)" }}
                />

                <div className="relative flex-1 overflow-y-auto overflow-y-hiddenhidden scrollbar-none pt-20 px-4 pb-4">
                  <motion.ul className="flex flex-col gap-1.5" role="menu">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <motion.li key={link.href} variants={itemVariants}>
                          <a
                            href={link.href}
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center gap-3 rounded-2xl px-3 py-3 active:scale-[0.98] transition-all"
                          >
                            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-brand text-white shrink-0">
                              <Icon className="w-4.5 h-4.5" />
                            </span>

                            <span
                              className="relative text-[15px] font-semibold text-foreground tracking-tight
                       after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:rounded-full
                       after:bg-gradient-to-r after:from-brand-blue after:to-brand-rose
                       after:transition-all after:duration-300 group-hover:after:w-full group-active:after:w-full"
                            >
                              {link.label}
                            </span>

                            <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="relative flex flex-col gap-2.5 p-4 border-t border-border bg-background/60"
                >
                  {!isLoading && user ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full gap-1"
                      onClick={handleLogout}
                    >
                      Déconnexion
                      <LogOut className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full rounded-full"
                        nativeButton={false}
                        render={<NextLink href="/auth/login" />}
                      >
                        Connexion
                      </Button>
                      <Button
                        size="lg"
                        className="w-full bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground rounded-full shadow-md gap-1"
                        nativeButton={false}
                        render={<NextLink href="/auth/Registration" />}
                      >
                        S&apos;inscrire
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}