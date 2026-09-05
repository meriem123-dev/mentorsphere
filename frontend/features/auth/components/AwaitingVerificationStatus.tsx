"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const POLL_INTERVAL_MS = 4000;

//mon cmpst
export function AwaitingVerificationStatus() {
  const { user, isLoading, refetch } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // polling tant que l'email n'est pas vérifié
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.isEmailVerified) return; // le prochain effect gère la redirection

    const interval = setInterval(() => {
      refetch();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLoading, user, refetch, router]);

  // redirection automatique dès que vérifié
  useEffect(() => {
    if (!user?.isEmailVerified || hasRedirected.current) return;

    hasRedirected.current = true;
    const destination =
      user.role === "MENTOR"
        ? "/auth/ProfileCompletion/Mentor"
        : "/auth/ProfileCompletion/Entrepreneur";

    router.replace(destination);
  }, [user, router]);

  //animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  //mon rendu
  return (
    <motion.div
      className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 lg:px-12 py-12 lg:py-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="w-full max-w-md mb-8 flex items-center justify-between" variants={itemVariants}>
        <div className="flex items-center gap-4">
          <div className="block md:hidden">
            <Logo compact className="w-28" />
          </div>
          <div className="hidden md:block">
            <Logo />
          </div>
        </div>
        <ThemeToggle />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="w-full max-w-md flex flex-col items-center text-center gap-4"
      >
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-brand text-white">
          <MailCheck className="w-6 h-6" />
        </span>
        <h1 className="text-2xl font-bold text-foreground">Vérifiez votre boîte mail</h1>
        <p className="text-muted-foreground">
          Un email de confirmation vous a été envoyé{user?.email ? ` à ${user.email}` : ""}.(vérifiez vos spams)
          Cliquez sur le lien pour continuer — cette page se met à jour automatiquement.
        </p>
        <span className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          En attente de confirmation...
        </span>
      </motion.div>
    </motion.div>
  );
}