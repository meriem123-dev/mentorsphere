"use client";

import { useBackendWarmup } from "@/hooks/use-backend-warmup";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function BackendWarmupBanner() {
  const status = useBackendWarmup();

  return (
    <AnimatePresence>
      {status === "slow" && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-100 zoom-75 bg-accent text-foreground text-sm py-1 px-4 flex items-center justify-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
            Le serveur est en train de se réveiller, cela peut prendre quelques secondes ...
        </motion.div>
      )}
    </AnimatePresence>
  );
}