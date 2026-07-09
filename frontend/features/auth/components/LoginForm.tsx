"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TextInput } from "./TextInput";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NextLink from "next/link";

import { authApi } from "@/features/auth/api/authAPI";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/authTypes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

//mon cmpst
export function LoginForm() {
  const [role, setRole] = useState<"entrepreneur" | "mentor">("entrepreneur");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  //valider les champs
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Mot de passe requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Au minimum 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //gérer soumission form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      toast.success("Connexion réussie", {
        description: `Content de te revoir, ${response.data.user.firstName} !`,
      });

      router.push("/auth/ProfileCompletion/Entrepreneur");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      toast.error("Connexion impossible", {
        description:
          axiosError.response?.data?.message ||
          "Email ou mot de passe incorrect",
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
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  //mon rendu
  return (
    <motion.div
      className="w-full lg:w-1/2 flex flex-col justify-start items-center px-6 lg:px-12 py-12 lg:py-15"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="w-full max-w-md mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          {/* Logo */}
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Bon retour</h1>
        <p className="text-muted-foreground">
          Connectez-vous à votre espace MentorSphere.
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5"
        variants={containerVariants}
      >
 

        {/* Email Input */}
        <TextInput
          label="Email"
          name="email"
          type="email"
          placeholder="username@gmail.com"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
        />

        {/* Password Input */}
        <TextInput
          label="Mot de passe"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="******"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
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

        {/* Forgot Password Link */}
        <motion.div className="flex justify-end" variants={itemVariants}>
          <button
            type="button"
            className="text-sm text-primary hover:underline font-medium"
          >
            Mot de passe oublié ?
          </button>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            variant={"default"}
            className="w-full py-5 font-semibold"
          >
            Se connecter
          </Button>
        </motion.div>

        {/* Sign Up Link */}
        <motion.p
          className="text-center text-sm text-muted-foreground"
          variants={itemVariants}
        >
          Pas encore de compte?{" "}
          <Button
            type="button"
            variant={"link"}
            className="text-primary hover:underline font-semibold"
            nativeButton={false}
             render={(props) => (
                <NextLink href="/auth/Registration" {...props}>
                  {props.children}
                </NextLink>
              )}
          >
            S&apos;inscrire gratuitement
          </Button>
        </motion.p>
      </motion.form>
    </motion.div>
  );
}
