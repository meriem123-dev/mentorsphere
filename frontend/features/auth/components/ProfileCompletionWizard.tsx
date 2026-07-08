"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileFormData } from "@/types/authTypes";
import ProfilePhotoSection from "./ProfilePhotoSection";
import AboutSection from "./AboutSection";
import { EntrepreneurialJourneyStep } from "./EntrepreneurialJourney";
import{SearchAvailabilityStep} from "./SearchAvailabilityStep"
import StepShell from "./StepShell";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

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
  const router = useRouter();

  const goNext = () => setStep((s) => s + 1);
  const goPrevious = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    console.log("Form Data finale:", formData);
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
    />
  );}

  return null; // step 3 
}