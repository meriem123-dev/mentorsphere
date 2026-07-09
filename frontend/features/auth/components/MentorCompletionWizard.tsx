"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MentorProfileFormData } from "@/types/authTypes";
import ProfilePhotoSection from "./ProfilePhotoSection";
import AboutSection from "./AboutSection";
import { ExpertiseStep } from "./ExpertiseStep";
import { AvailabilityLinksStep } from "./AvailabilityLinksStep";
import StepShell from "./StepShell";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const INITIAL_FORM_DATA: MentorProfileFormData = {
  bio: "",
  birthDate: "",
  country: "Algérie",
  city: "",
  languages: ["Français"],
  photo: null,
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
};

//intégrer les étapes
export function MentorCompletionWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MentorProfileFormData>(INITIAL_FORM_DATA);
  const router = useRouter();

  const goNext = () => setStep((s) => s + 1);
  const goPrevious = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    console.log("Form Data mentor finale:", formData);
    router.push("/dashboard");
  };

  if (step === 1) {
    return (
      <StepShell currentStep={1} totalSteps={3} title="Profil Personnel" icon={User}>
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
      />
    );
  }

  return null;
}