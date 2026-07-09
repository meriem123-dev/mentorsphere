"use client";

import { MentorProfileFormData } from "@/types/authTypes";
import StepShell from "./StepShell";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { RadioChoices } from "@/components/ui/RadioChoices";
import { SkillsInput } from "./SkillsInput";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import{BriefcaseBusiness} from "lucide-react"

const EXPERTISE_DOMAINS = [
  "Développement produit",
  "Marketing digital",
  "Levée de fonds",
  "Stratégie business",
  "Gestion d'équipe",
  "Finance & comptabilité",
  "Vente & négociation",
  "Tech & innovation",
];

const EXPERIENCE_LEVELS = [
  { value: "1-3", label: "1 à 3 ans" },
  { value: "4-7", label: "4 à 7 ans" },
  { value: "8-15", label: "8 à 15 ans" },
  { value: "15+", label: "15 ans et plus" },
];

interface ExpertiseStepProps {
  formData: MentorProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<MentorProfileFormData>>;
  onNext: () => void;
  onPrevious: () => void;
}

export function ExpertiseStep({
  formData,
  setFormData,
  onNext,
  onPrevious,
}: ExpertiseStepProps) {
  return (
    <StepShell currentStep={2} totalSteps={3} title="Expérience & Expertise" icon={Briefcase}>
       <SectionCard icon={<BriefcaseBusiness size={16} />} title="Expérience">
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Profession actuelle
          </label>
          <input
            type="text"
            value={formData.profession}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, profession: e.target.value }))
            }
            placeholder="Ex: Fondateur & CEO chez..."
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Années d&apos;expérience
          </label>
          <RadioChoices
            options={EXPERIENCE_LEVELS}
            value={formData.yearsOfExperience}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, yearsOfExperience: val }))
            }
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Domaines d&apos;expertise
          </label>
          <ChoicePills
            options={EXPERTISE_DOMAINS}
            value={formData.domains}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, domains: val as string[] }))
            }
            multiple
            showCheck
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Compétences spécifiques
          </label>
          <SkillsInput
            value={formData.skills}
            onChange={(vals) =>
              setFormData((prev) => ({ ...prev, skills: vals }))
            }
            placeholder="Ajouter une compétence et appuyer sur Entrée"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={onPrevious} variant="outline" className="w-1/2">
          Retour
        </Button>
        <Button onClick={onNext} variant="default" className="w-1/2">
          Continuer
        </Button>
      </div>
       </SectionCard>
    </StepShell>
  );
}