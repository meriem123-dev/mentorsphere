"use client";

import SectionCard from "@/components/ui/SectionCard";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { RadioChoices } from "@/components/ui/RadioChoices";
import { SkillsInput } from "./SkillsInput";
import {BriefcaseBusiness, BriefcaseBusinessIcon,UsersRound,PenLine,PencilSparkles} from 'lucide-react'
import StepShell from "./StepShell";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@/types/authTypes";
import { SetProfileFormData } from "@/types/authTypes";



interface EntrepreneurialJourneyStepProps {
  formData: ProfileFormData;
  setFormData: SetProfileFormData;
  onNext: () => void;
  onPrevious: () => void;
}

const PROFESSIONS = ["Étudiant(e)", "Salarié(e)", "Freelance", "Entrepreneur(e)", "Autre"];

const LEVELS = [
  { value: "discovering", label: "Je découvre l'entrepreneuriat" },
  { value: "idea", label: "J'ai une idée" },
  { value: "prototype", label: "Je développe un prototype" },
  { value: "mvp", label: "J'ai un MVP" },
  { value: "startup", label: "J'ai une startup" },
];

const DOMAINS = [
  "Intelligence Artificielle",
  "FinTech",
  "HealthTech",
  "EdTech",
  "GreenTech",
  "Cybersecurity",
  "Blockchain & Web3",
  "SaaS",
  "Marketplace",
  "E-commerce",
  "AgriTech",
  "FoodTech",
  "PropTech",
  "Logistique",
  "TravelTech",
  "SportTech",
  "FashionTech",
  "LegalTech",
  "HRTech",
  "Media & Creator Economy",
  "Gaming",
  "IoT",
  "Biotech",
];


//cmpst
export function EntrepreneurialJourneyStep({
  formData,
  setFormData,
  onNext,
  onPrevious,
}: EntrepreneurialJourneyStepProps) {
  return (
    <StepShell
      currentStep={2}
      totalSteps={3}
      title="Parcours Entrepreneurial"
      icon={BriefcaseBusiness}
    >

      {/*profession */}
      <div className="space-y-4">
        <SectionCard title="Profession actuelle" icon={<BriefcaseBusinessIcon/>}>
          <ChoicePills
            options={PROFESSIONS}
            value={formData.profession}
            
            onChange={(value) => setFormData({ ...formData, profession: value as string })}
          />
        </SectionCard>

        {/*nv entrepreneurial */}
        <SectionCard title="Niveau entrepreneurial *" icon={<UsersRound />}>
          <RadioChoices
            options={LEVELS}
            value={formData.level}
            onChange={(value) => setFormData({ ...formData, level: value })}
          />
        </SectionCard>

        {/*domaines d'interet */}
        <SectionCard title="Domaines d'intérêt *" icon={<PenLine />}>
          <ChoicePills
            options={DOMAINS}
            value={formData.domains}
            onChange={(value) => setFormData({ ...formData, domains: value as string[] })}
            multiple
            showCheck
          />
        </SectionCard>

        {/*skills */}
        <SectionCard title="Compétences" icon={<PencilSparkles />}>
          <SkillsInput
            value={formData.skills}
            onChange={(value) => setFormData({ ...formData, skills: value })}
          />
        </SectionCard>
      </div>

      {/*bouttons */}
      <div className="flex gap-3 mt-8">
        <Button
          type="button"
          onClick={onPrevious}
          variant={"ghost"}
          className={"w-1/2"}
        >
           Précédent 
        </Button>
        <Button
          type="button"
          onClick={onNext}
          variant={"default"}
          className={"w-1/2"}
        >
          Continuer 
        </Button>
      </div>
    </StepShell>
  );
}
