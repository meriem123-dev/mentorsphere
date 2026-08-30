"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TextInput } from "./TextInput";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authApi } from "@/features/auth/api/authAPI";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/authTypes";
import { toast } from "sonner";

//mon cmpst
export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Mot de passe requis";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Au minimum 6 caractères";
    }

    if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //gérer soumission form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Lien invalide", {
        description: "Aucun token de réinitialisation trouvé dans le lien",
      });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({ token, newPassword: formData.newPassword });
      setIsDone(true);
      toast.success("Mot de passe réinitialisé");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      toast.error("Réinitialisation impossible", {
        description:
          axiosError.response?.data?.message ||
          "Le lien est peut-être expiré, redemandez-en un nouveau",
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

        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isDone ? "Mot de passe mis à jour" : "Nouveau mot de passe"}
        </h1>
        <p className="text-muted-foreground">
          {isDone
            ? "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
            : "Choisissez un nouveau mot de passe pour votre compte."}
        </p>
      </motion.div>

      {!isDone ? (
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5"
          variants={containerVariants}
        >
          <TextInput
            label="Nouveau mot de passe"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 6 caractères"
            value={formData.newPassword}
            onChange={handleInputChange}
            error={errors.newPassword}
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <TextInput
            label="Confirmation"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Répétez le mot de passe"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            icon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="w-full py-5 font-semibold"
            >
              {isSubmitting ? "Mise à jour..." : "Réinitialiser le mot de passe"}
            </Button>
          </motion.div>
        </motion.form>
      ) : (
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md flex flex-col items-center gap-6 py-6"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-brand text-white">
            <CheckCircle2 className="w-6 h-6" />
          </span>
          <Button
            type="button"
            variant="default"
            className="w-full py-5 font-semibold"
            nativeButton={false}
            render={(props) => (
              <NextLink href="/auth/login" {...props}>
                {props.children}
              </NextLink>
            )}
          >
            Aller à la connexion
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}