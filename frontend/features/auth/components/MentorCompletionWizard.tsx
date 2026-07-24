"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiErrorResponse, MentorProfileFormData } from "@/types/authTypes";
import ProfilePhotoSection from "./ProfilePhotoSection";
import AboutSection from "./AboutSection";
import { ExpertiseStep } from "./ExpertiseStep";
import { AvailabilityLinksStep } from "./AvailabilityLinksStep";
import StepShell from "./StepShell";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { authApi } from "../api/authAPI";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { isValidAge, isValidCity, isValidUrl } from "../utils/validation";
import { getDashboardPath } from "@/lib/routes";
import { useAuth } from "@/context/AuthContext";

//intégrer les étapes
export function MentorCompletionWizard() {
  const { user, refetch } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MentorProfileFormData>(() => ({
    firstName: "",
    lastName: "",
    bio: "",
    birthDate: "",
    country: "Algérie",
    city: "",
    languages: ["Français"],
    photo: null,
    avatarColor: "bg-brand-blue",
    profession: "",
    yearsOfExperience: "",
    domains: [],
    skills: [],
    availability: [],
    linkedin: "",
    github: "",
    portfolio: "",
    website: "",
    cv: null,
    documents: [],
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // valeurs dérivées, calculées au render
  const displayFirstName = formData.firstName || user?.firstName || "";
  const displayLastName = formData.lastName || user?.lastName || "";

  //valide les champs de l'étape 1 avant de continuer
  const validateStep1 = () => {
    if (!formData.bio || formData.bio.trim().length < 10) {
      toast.error("Merci de renseigner une biographie (min 10 caractères)");
      return false;
    }
    if (!formData.country) {
      toast.error("Merci de sélectionner un pays");
      return false;
    }
    if (!formData.city || formData.city.trim().length === 0) {
      toast.error("Merci de renseigner votre ville");
      return false;
    }
    if (!isValidCity(formData.city)) {
      toast.error("Le nom de la ville ne doit pas contenir de chiffres");
      return false;
    }
    if (!isValidAge(formData.birthDate)) {
      toast.error(
        formData.birthDate
          ? "Vous devez avoir au moins 15 ans"
          : "Merci de renseigner votre date de naissance",
      );
      return false;
    }
    if (formData.languages.length === 0) {
      toast.error("Merci de sélectionner au moins une langue");
      return false;
    }
    return true;
  };

  //valide les champs de l'étape 2 avant de continuer
  const validateStep2 = () => {
    if (!formData.profession || formData.profession.trim().length < 2) {
      toast.error("Merci de renseigner votre profession");
      return false;
    }
    if (!formData.yearsOfExperience) {
      toast.error("Merci de sélectionner vos années d'expérience");
      return false;
    }
    if (formData.domains.length === 0) {
      toast.error("Merci de sélectionner au moins un domaine d'expertise");
      return false;
    }
    return true;
  };

  //valider step 3
  const validateStep3 = () => {
    if (!isValidUrl(formData.linkedin)) {
      toast.error("Le lien LinkedIn n'est pas une URL valide");
      return false;
    }
    if (!isValidUrl(formData.github)) {
      toast.error("Le lien GitHub n'est pas une URL valide");
      return false;
    }
    if (!isValidUrl(formData.portfolio)) {
      toast.error("Le lien Portfolio n'est pas une URL valide");
      return false;
    }
    if (!isValidUrl(formData.website)) {
      toast.error("Le lien du site web n'est pas une URL valide");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const goPrevious = () => setStep((s) => Math.max(1, s - 1));

  //gérer clic terminer
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setIsSubmitting(true);
    try {
      const payload: MentorProfileFormData = {
        ...formData,
        firstName: displayFirstName,
        lastName: displayLastName,
      };
      const res = await authApi.completeMentorProfile(formData);
      toast.success("Profil complété avec succès");
      await refetch();
      router.push(getDashboardPath(res.data.user.role));
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const firstError = axiosError.response?.data?.errors
        ? Object.values(axiosError.response.data.errors)[0]
        : undefined;

      toast.error("Erreur lors de la complétion du profil", {
        description:
          firstError ||
          axiosError.response?.data?.message ||
          "Une erreur est survenue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <StepShell
        currentStep={1}
        totalSteps={3}
        title="Profil Personnel"
        icon={User}
      >
        <div className="space-y-8">
          <ProfilePhotoSection
            formData={{
              ...formData,
              firstName: displayFirstName,
              lastName: displayLastName,
            }}
            setFormData={setFormData}
          />
          <AboutSection formData={formData} setFormData={setFormData} />
        </div>
        <Button onClick={goNext} variant="default" className="w-full mt-8">
          Continuer
        </Button>
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <ExpertiseStep
        formData={formData}
        setFormData={setFormData}
        onNext={goNext}
        onPrevious={goPrevious}
      />
    );
  }

  if (step === 3) {
    return (
      <AvailabilityLinksStep
        formData={formData}
        setFormData={setFormData}
        onPrevious={goPrevious}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return null;
}
