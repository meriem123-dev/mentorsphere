"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Map } from "lucide-react";
import NextLink from "next/link";
import type { Startup } from "@/types/startupTypes";
import { startupApi } from "@/features/projets/api/startuAPI";
import { getStepStats } from "@/features/projets/utils/stepMeta";

type Props = {
  basePath: string;
  hoverClass: string;
  focusRing: string;
};

export function StartupNavSection({ basePath, hoverClass, focusRing }: Props) {
  const pathname = usePathname();
  const isSectionActive = pathname.startsWith(basePath);

  const [manuallyOpen, setManuallyOpen] = useState(false);
  const isOpen = isSectionActive || manuallyOpen;

  const [items, setItems] = useState<Startup[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || hasLoaded) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await startupApi.getMine();
        if (!cancelled) setItems(res.data.startups);
      } catch {
        // silencieux
      } finally {
        if (!cancelled) setHasLoaded(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, hasLoaded]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setManuallyOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          isSectionActive ? "bg-gradient-brand text-white" : `text-muted-foreground ${hoverClass}`
        } ${focusRing}`}
      >
        <Map className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="flex-1 truncate text-left">Mon Parcours</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-3 mt-1 space-y-0.5 border-l border-border pl-3">
              {items.map((item) => {
                const href = `${basePath}/${item.id}`;
                const isActive = pathname === href;
                const { progressPercent } = getStepStats(item.steps);
                const dotClass =
                  progressPercent === 100
                    ? "bg-success"
                    : progressPercent > 0
                      ? "bg-brand-blue"
                      : "bg-muted-foreground";

                return (
                  <NextLink
                    key={item.id}
                    href={href}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${focusRing} ${
                      isActive ? "font-medium text-foreground" : `text-muted-foreground ${hoverClass}`
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
                    <span className="truncate">{item.name}</span>
                  </NextLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}