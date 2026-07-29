"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, PenSquare } from "lucide-react";
import NextLink from "next/link";
import type { WorkspaceSummary } from "@/types/workspaceTypes";
import { workspaceApi } from "@/features/workspace/api/workspaceAPI";

type Props = {
  basePath: string;
  hoverClass: string;
  focusRing: string;
};

export function WorkspaceNavSection({ basePath, hoverClass, focusRing }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(pathname.startsWith(basePath));
  const [items, setItems] = useState<WorkspaceSummary[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || hasLoaded) return;

    let cancelled = false;

    const load = async () => {
      try {
        const summaries = await workspaceApi.getSummaries();
        if (!cancelled) setItems(summaries);
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
        onClick={() => setIsOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors ${hoverClass} ${focusRing}`}
      >
        <PenSquare className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="flex-1 truncate text-left">Workspace</span>
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
                return (
                  <NextLink
                    key={item.id}
                    href={href}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${focusRing} ${
                      isActive ? "font-medium text-foreground" : `text-muted-foreground ${hoverClass}`
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    <span className="truncate">{item.startupName}</span>
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