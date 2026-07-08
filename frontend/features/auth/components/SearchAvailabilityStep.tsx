"use client";

import SectionCard from "@/components/ui/SectionCard";
import { CheckboxGroup } from "@/components/ui/CheckBoxGroup";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { TextInput } from "./TextInput";
import { FileUploadInput } from "@/components/ui/FileUploadInput";
import StepShell from "./StepShell";
import { Button } from "@/components/ui/button";
import { CheckCircle2,FileText,SearchCheck,Link,CalendarClock } from "lucide-react";
import { ProfileFormData, SetProfileFormData } from "@/types/authTypes";

interface SearchAvailabilityStepProps {
  formData: ProfileFormData;
  setFormData: SetProfileFormData;
  onPrevious: () => void;
  onSubmit: () => void;
}

const LOOKING_FOR_OPTIONS = [
  { value: "find_mentor", label: "Trouver un mentor" },
  { value: "validate_idea", label: "Valider mon idée" },
  { value: "business_model", label: "Conseils sur le business model" },
  { value: "build_mvp", label: "Créer un MVP" },
  { value: "find_cofounders", label: "Trouver des cofondateurs" },
  { value: "networking", label: "Développer mon réseau" },
  { value: "fundraising", label: "Préparer une levée de fonds" },
  { value: "find_investors", label: "Trouver des investisseurs" },
  { value: "legal_advice", label: "Conseils juridiques" },
  { value: "marketing_advice", label: "Conseils marketing" },
  { value: "technical_advice", label: "Conseils techniques" },
  { value: "skill_development", label: "Développer mes compétences" },
  { value: "startup_growth", label: "Accélérer la croissance de ma startup" },
  { value: "join_community", label: "Rejoindre une communauté" },
];

const AVAILABILITY_OPTIONS = ["Jours de semaine", "Soirées", "Week-end"];

//cmpst
export function SearchAvailabilityStep({
  formData,
  setFormData,
  onPrevious,
  onSubmit,
}: SearchAvailabilityStepProps) {
  return (
    <StepShell currentStep={3} totalSteps={3} title="Recherche & Disponibilités" emoji="🤝">
      <div className="space-y-4">
        {/*ce que je recherche*/}
        <SectionCard title="Ce que je recherche" icon={<SearchCheck />}>
          <CheckboxGroup
            options={LOOKING_FOR_OPTIONS}
            value={formData.lookingFor}
            onChange={(value) => setFormData({ ...formData, lookingFor: value })}
          />
        </SectionCard>

        {/*réseaux sociaux*/}
        <SectionCard title="Réseaux sociaux" icon={<Link />}>
          <div className="space-y-3">
            <TextInput
              label="LinkedIn"
              placeholder="linkedin.com/in/yourname"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            />
            <TextInput
              label="GitHub"
              placeholder="github.com/yourname"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            />
            <TextInput
              label="Portfolio"
              placeholder="portfolio.yourname.com"
              value={formData.portfolio}
              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            />
            <TextInput
              label="Site Web"
              placeholder="www.yoursite.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
        </SectionCard>

        {/*disponibilités*/}
        <SectionCard title="Disponibilités" icon={<CalendarClock />}>
          <ChoicePills
            options={AVAILABILITY_OPTIONS}
            value={formData.availability}
            onChange={(value) => setFormData({ ...formData, availability: value as string[] })}
            multiple
          />
        </SectionCard>

        {/*documents*/}
        <SectionCard title="Documents (optionnel)" icon={<FileText />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FileUploadInput
              label="Importer CV"
              files={formData.cv ? [formData.cv] : []}
              onChange={(files) => setFormData({ ...formData, cv: files[0] ?? null })}
            />
            <FileUploadInput
              label="Importer Documents"
              multiple
              files={formData.documents}
              onChange={(files) => setFormData({ ...formData, documents: files })}
            />
          </div>
        </SectionCard>
      </div>

      {/*boutons*/}
      <div className="flex gap-3 mt-8">
        <Button type="button" onClick={onPrevious} variant="ghost" className="w-1/2">
          Précédent
        </Button>
        <Button type="button" onClick={onSubmit} variant="default" className="w-1/2 bg-gradient-brand">
          <CheckCircle2 size={16} className="mr-1" />
          Finaliser mon profil
        </Button>
      </div>
    </StepShell>
  );
}