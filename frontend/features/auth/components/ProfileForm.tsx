"use client";

import { useState } from "react";
import ProfilePhotoSection from "./ProfilePhotoSection";
import AboutSection from "./AboutSection";
import StepShell from "./StepShell";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { User } from "lucide-react";

export function ProfileForm() {
  const [formData, setFormData] = useState({
    bio: "",
    birthDate: "",
    country: "Algérie",
    city: "Béjaia",
    languages: ["Français"],
    photo: null,
  });

  const handleContinue = () => {
    console.log("Form Data:", formData);
  };

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

      <Button
        onClick={handleContinue}
        variant="default"
        className="w-full mt-8"
        nativeButton={false}
        render={(props) => (
          <NextLink href="/auth/ProfileCompletion/Step2" {...props}>
            {props.children}
          </NextLink>
        )}
      >
        Continuer 
      </Button>
    </StepShell>
  );
}