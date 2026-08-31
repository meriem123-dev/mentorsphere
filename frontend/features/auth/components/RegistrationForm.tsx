"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { TextInput } from "./TextInput";
import { RoleCard } from "./RoleCard";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, BriefcaseBusiness, Users, Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import NextLink from "next/link";

import { authApi } from "@/features/auth/api/authAPI";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/authTypes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { GoogleAuthButton } from "./GoogleAuthButton";

type Role = "entrepreneur" | "mentor";

const roleConfig: Record<
  Role,
  { title: string; icon: typeof BriefcaseBusiness }
> = {
  entrepreneur: { title: "Entrepreneur", icon: BriefcaseBusiness },
  mentor: { title: "Mentor Expert", icon: Users },
};

//mon cmpst
export function RegistrationForm() {
  const [role, setRole] = useState<Role>("entrepreneur");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleSectionRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const router = useRouter();
  const { refetch } = useAuth();

  //gérer changement input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  //valider les champs
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = "Prénom requis";
    if (!formData.lastName) newErrors.lastName = "Nom requis";

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmation requise";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //gérer soumission form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!acceptedTerms || !acceptedPrivacy) return;

    setIsSubmitting(true);

    try {
      const response = await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role,
      });

      toast.success("Compte créé avec succès", {
        description: `Un email de vérification a été envoyé à ${formData.email}.`,
      });

      await refetch();

      router.push("/auth/awaiting-verification");
      
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      if (axiosError.response?.data?.errors) {
        setErrors(axiosError.response.data.errors);
      } else if (status === 409) {
        setErrors((prev) => ({
          ...prev,
          email: message || "Un compte existe déjà avec cet email",
        }));
      } else {
        toast.error("Inscription impossible", {
          description: message || "Une erreur est survenue",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = acceptedTerms && acceptedPrivacy;

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

  const SelectedIcon = roleConfig[role].icon;

  //mon rendu
  return (
    <motion.div
      className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 lg:px-12 py-12 lg:py-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
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
          Créer un compte
        </h1>
        <p className="text-muted-foreground">
          Rejoignez la communauté de bâtisseurs de startups.
        </p>
      </motion.div>

      {/* Role Selection */}
      <motion.div
        ref={roleSectionRef}
        className="w-full max-w-md mb-8"
        variants={itemVariants}
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Je suis un(e)...
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <RoleCard
            role="entrepreneur"
            title="Entrepreneur"
            description="J'ai une idée / startup"
            icon={BriefcaseBusiness}
            isSelected={role === "entrepreneur"}
            onChange={setRole}
          />
          <RoleCard
            role="mentor"
            title="Mentor Expert"
            description="J'aide les fondateurs"
            icon={Users}
            isSelected={role === "mentor"}
            onChange={setRole}
          />
        </div>
      </motion.div>

      {/* Registration Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5"
        variants={containerVariants}
      >
        {/* Prénom / Nom */}
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Prénom"
            name="firstName"
            type="text"
            placeholder="Meriem"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
          />
          <TextInput
            label="Nom"
            name="lastName"
            type="text"
            placeholder="HAMOUCHE"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
          />
        </div>

        {/* Email Input */}
        <TextInput
          label="Adresse e-mail"
          name="email"
          type="email"
          placeholder="votremail@gmail.com"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
        />

        {/* Password Input */}
        <TextInput
          label="Mot de passe"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Minimum 6 caractères"
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

        {/* Confirm Password Input */}
        <TextInput
          label="Confirmation du mot de passe"
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

        {/* Résumé du rôle sélectionné */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-brand text-white shrink-0">
              <SelectedIcon className="w-4.5 h-4.5" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              {roleConfig[role].title}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              roleSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            Changer
          </button>
        </motion.div>

        {/* Checkboxes légales */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <span
              onClick={() => setAcceptedTerms((v) => !v)}
              className={cn(
                "mt-0.5 flex items-center justify-center w-4.5 h-4.5 rounded-md border shrink-0 transition-colors",
                acceptedTerms
                  ? "bg-brand-blue border-brand-blue"
                  : "border-border bg-background",
              )}
            >
              {acceptedTerms && <Check className="w-3 h-3 text-white" />}
            </span>
            <span className="text-sm text-foreground">
              J&apos;accepte les{" "}
              <NextLink
                href="/legal/terms"
                className="text-brand-blue hover:underline font-medium"
              >
                Conditions d&apos;utilisation
              </NextLink>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <span
              onClick={() => setAcceptedPrivacy((v) => !v)}
              className={cn(
                "mt-0.5 flex items-center justify-center w-4.5 h-4.5 rounded-md border shrink-0 transition-colors",
                acceptedPrivacy
                  ? "bg-brand-blue border-brand-blue"
                  : "border-border bg-background",
              )}
            >
              {acceptedPrivacy && <Check className="w-3 h-3 text-white" />}
            </span>
            <span className="text-sm text-foreground">
              J&apos;accepte la{" "}
              <NextLink
                href="/legal/privacy"
                className="text-brand-blue hover:underline font-medium"
              >
                Politique de confidentialité
              </NextLink>
            </span>
          </label>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            variant="default"
            disabled={!canSubmit}
            className="w-full py-5 font-semibold rounded-full"
          >
            Créer un compte
          </Button>

        </motion.div>

         <motion.div
            variants={itemVariants}
            className="flex items-center gap-5"
          >
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OU</span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>

          <motion.div variants={itemVariants}>
            <GoogleAuthButton role={role} />
          </motion.div>

        {/* Login Link */}
        <motion.p
          className="text-center text-sm text-muted-foreground"
          variants={itemVariants}
        >
          Déjà un compte ?{" "}
          <Button
            type="button"
            variant={"link"}
            className="text-primary hover:underline font-semibold"
            nativeButton={false}
            render={(props) => (
              <NextLink href="/auth/login" {...props}>
                {props.children}
              </NextLink>
            )}
          >
            Se connecter
          </Button>
        </motion.p>
      </motion.form>
    </motion.div>
  );
}
