"use client";

import { motion } from "framer-motion";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { RadioChoices } from "@/components/ui/RadioChoices";
import { SkillsInput } from "./SkillsInput";
import {BriefcaseBusiness} from 'lucide-react'
import StepShell from "./StepShell";

interface EntrepreneurialJourneyStepProps {
  formData: any;
  setFormData: (data: any) => void;
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
  "AI", "FinTech", "EdTech", "HealthTech", "GreenTech", "SaaS", "E-commerce",
  "Agriculture", "Cybersecurity", "Blockchain", "Marketplace", "Logistique",
  "Immobilier", "Sport", "Mode",
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

      <div className="space-y-4">
        <SectionCard title="Profession actuelle">
          <ChoicePills
            options={PROFESSIONS}
            value={formData.profession}
            onChange={(value) => setFormData({ ...formData, profession: value })}
          />
        </SectionCard>

        <SectionCard title="Niveau entrepreneurial">
          <RadioChoices
            options={LEVELS}
            value={formData.level}
            onChange={(value) => setFormData({ ...formData, level: value })}
          />
        </SectionCard>

        <SectionCard title="Domaines d'intérêt">
          <ChoicePills
            options={DOMAINS}
            value={formData.domains}
            onChange={(value) => setFormData({ ...formData, domains: value })}
            multiple
            showCheck
          />
        </SectionCard>

        <SectionCard title="Compétences">
          <SkillsInput
            value={formData.skills}
            onChange={(value) => setFormData({ ...formData, skills: value })}
          />
        </SectionCard>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={onPrevious}
          className="flex-1 px-6 py-3 rounded-full border border-border text-foreground font-semibold hover:bg-muted transition-colors"
        >
           Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          Continuer 
        </button>
      </div>
    </StepShell>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}