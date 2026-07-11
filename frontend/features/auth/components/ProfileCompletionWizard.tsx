"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiErrorResponse, ProfileFormData } from "@/types/authTypes";
import ProfilePhotoSection from "./ProfilePhotoSection";
import AboutSection from "./AboutSection";
import { EntrepreneurialJourneyStep } from "./EntrepreneurialJourney";
import { SearchAvailabilityStep } from "./SearchAvailabilityStep";
import StepShell from "./StepShell";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { authApi } from "../api/authAPI";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { isValidAge, isValidCity, isValidUrl } from "../utils/validation";
import { getDashboardPath } from "@/lib/routes";

const INITIAL_FORM_DATA: ProfileFormData = {
  bio: "",
  birthDate: "",
  country: "Algérie",
  city: "",
  languages: ["Français"],
  photo: null,
  profession: "",
  level: "",
  domains: [],
  skills: [],
  lookingFor: [],
  linkedin: "",
  github: "",
  portfolio: "",
  website: "",
  availability: [],
  cv: null,
  documents: [],
};

//composant qui enveloppe toutes les étapes
export function ProfileCompletionWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    if (!formData.level) {
      toast.error("Merci de sélectionner votre niveau entrepreneurial");
      return false;
    }
    if (formData.domains.length === 0) {
      toast.error("Merci de sélectionner au moins un domaine");
      return false;
    }
    return true;
  };

  //valider etp3
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
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const goPrevious = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setIsSubmitting(true);

    try {
      const res = await authApi.completeEntrepreneurProfile(formData);
      toast.success("Profil complété avec succès");
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
          <ProfilePhotoSection formData={formData} setFormData={setFormData} />
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
      <EntrepreneurialJourneyStep
        formData={formData}
        setFormData={setFormData}
        onNext={goNext}
        onPrevious={goPrevious}
      />
    );
  }

  if (step === 3) {
    return (
      <SearchAvailabilityStep
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
