"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TextInput } from "./TextInput";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NextLink from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";

import { authApi } from "@/features/auth/api/authAPI";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/authTypes";
import { toast } from "sonner";

//mon cmpst
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const validateForm = () => {
    if (!email) {
      setError("Email requis");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalide");
      return false;
    }
    return true;
  };

  //gérer soumission form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // le backend renvoie toujours un succès générique, même si l'email n'existe pas
      await authApi.forgotPassword({ email });
      setIsSent(true);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      toast.error("Une erreur est survenue", {
        description: axiosError.response?.data?.message || "Réessayez plus tard",
      });
    } finally {
      setIsSubmitting(false);
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
      <motion.div className="w-full max-w-md mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="block md:hidden">
              <Logo compact className="w-28" />
            </div>
            <div className="hidden md:block">
              <Logo />
            </div>
          </div>
          <ThemeToggle />
        </div>

        {!isSent ? (
          <>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-muted-foreground">
              Entrez votre email, nous vous enverrons un lien de réinitialisation.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-muted-foreground">
              Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé.
            </p>
          </>
        )}
      </motion.div>

      {!isSent ? (
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5"
          variants={containerVariants}
        >
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="username@gmail.com"
            value={email}
            onChange={handleInputChange}
            error={error}
          />

          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="w-full py-5 font-semibold"
            >
              {isSubmitting ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </motion.div>
        </motion.form>
      ) : (
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md flex flex-col items-center gap-4 py-6"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-brand text-white">
            <MailCheck className="w-6 h-6" />
          </span>
        </motion.div>
      )}

      <motion.div className="w-full max-w-md mt-6" variants={itemVariants}>
        <Button
          type="button"
          variant="link"
          className="text-primary hover:underline font-medium gap-1.5"
          nativeButton={false}
          render={(props) => (
            <NextLink href="/auth/login" {...props}>
              <ArrowLeft className="w-4 h-4" />
              {props.children}
            </NextLink>
          )}
        >
          Retour à la connexion
        </Button>
      </motion.div>
    </motion.div>
  );
}