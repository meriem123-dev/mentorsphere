"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { authApi } from "@/features/auth/api/authAPI";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/authTypes";
import { toast } from "sonner";

type VerifyState = "loading" | "success" | "error" | "missing";

//mon cmpst
export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("loading");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setState("missing");
        return;
      }

      try {
        await authApi.verifyEmail(token);
        if (!cancelled) setState("success");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  //renvoyer l'email de vérification
  const handleResend = async () => {
    if (!resendEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendEmail)) {
      toast.error("Email invalide");
      return;
    }

    setIsResending(true);

    try {
      await authApi.resendVerification({ email: resendEmail });
      setResendDone(true);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      toast.error("Envoi impossible", {
        description: axiosError.response?.data?.message || "Réessayez plus tard",
      });
    } finally {
      setIsResending(false);
    }
  };

  //animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
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
        {state === "loading" && (
          <>
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-muted text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </span>
            <h1 className="text-2xl font-bold text-foreground">Vérification en cours...</h1>
          </>
        )}

        {state === "success" && (
          <>
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-brand text-white">
              <CheckCircle2 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-foreground">Email vérifié</h1>
            <p className="text-muted-foreground">
              Votre adresse email a bien été confirmée.
            </p>
            <Button
              type="button"
              variant="default"
              className="w-full py-5 font-semibold mt-2"
              nativeButton={false}
              render={(props) => (
                <NextLink href="/auth/login" {...props}>
                  {props.children}
                </NextLink>
              )}
            >
              Aller à la connexion
            </Button>
          </>
        )}

        {(state === "error" || state === "missing") && (
          <>
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 text-destructive">
              <XCircle className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-foreground">Lien invalide ou expiré</h1>
            <p className="text-muted-foreground">
              Entrez votre email pour recevoir un nouveau lien de vérification.
            </p>

            {!resendDone ? (
              <div className="w-full flex flex-col gap-3 mt-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="username@gmail.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <Button
                  type="button"
                  variant="default"
                  disabled={isResending}
                  onClick={handleResend}
                  className="w-full py-5 font-semibold"
                >
                  {isResending ? "Envoi..." : "Renvoyer l'email"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Si ce compte existe et n&apos;est pas déjà vérifié, un nouvel email vient d&apos;être envoyé.
              </p>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}