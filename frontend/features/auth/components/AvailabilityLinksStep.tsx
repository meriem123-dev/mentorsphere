"use client";

import { MentorProfileFormData } from "@/types/authTypes";
import StepShell from "./StepShell";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const AVAILABILITY_SLOTS = [
  "Matin (8h-12h)",
  "Après-midi (13h-17h)",
  "Soir (18h-21h)",
  "Week-end",
];

interface AvailabilityLinksStepProps {
  formData: MentorProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<MentorProfileFormData>>;
  onPrevious: () => void;
  onSubmit: () => void;
}

export function AvailabilityLinksStep({
  formData,
  setFormData,
  onPrevious,
  onSubmit,
}: AvailabilityLinksStepProps) {
  return (
    <StepShell currentStep={3} totalSteps={3} title="Disponibilités & Liens" icon={Calendar}>
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Créneaux de disponibilité
          </label>
          <ChoicePills
            options={AVAILABILITY_SLOTS}
            value={formData.availability}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, availability: val as string[] }))
            }
            multiple
            showCheck
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">
            Liens professionnels
          </label>
          {[
            { key: "linkedin", placeholder: "URL LinkedIn" },
            { key: "github", placeholder: "URL GitHub" },
            { key: "portfolio", placeholder: "URL Portfolio" },
            { key: "website", placeholder: "Site web personnel" },
          ].map(({ key, placeholder }) => (
            <input
              key={key}
              type="text"
              value={formData[key as keyof MentorProfileFormData] as string}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={placeholder}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
        </div>

        
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={onPrevious} variant="outline" className="w-1/2">
          Retour
        </Button>
        <Button onClick={onSubmit} variant="default" className="w-1/2">
          Terminer
        </Button>
      </div>
    </StepShell>
  );
}