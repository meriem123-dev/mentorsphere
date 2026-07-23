"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import SectionCard from "@/components/ui/SectionCard";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { RadioChoices } from "@/components/ui/RadioChoices";
import { SkillsInput } from "@/features/auth/components/SkillsInput";
import { Button } from "@/components/ui/button";
import { BriefcaseBusinessIcon, UsersRound, PenLine, Sparkles } from "lucide-react";
import { profileApi } from "@/features/profile/api/profileAPI";
import { useAuth } from "@/context/AuthContext";
import type { ApiErrorResponse } from "@/types/authTypes";
import type { EntrepreneurEditProfile } from "@/types/profile";

const PROFESSIONS = ["Étudiant(e)", "Salarié(e)", "Freelance", "Entrepreneur(e)", "Autre"];

const LEVELS = [
  { value: "discovering", label: "Je découvre l'entrepreneuriat" },
  { value: "idea", label: "J'ai une idée" },
  { value: "prototype", label: "Je développe un prototype" },
  { value: "mvp", label: "J'ai un MVP" },
  { value: "startup", label: "J'ai une startup" },
];

const DOMAINS = [
  "Intelligence Artificielle", "FinTech", "HealthTech", "EdTech", "GreenTech",
  "Cybersecurity", "Blockchain & Web3", "SaaS", "Marketplace", "E-commerce",
  "AgriTech", "FoodTech", "PropTech", "Logistique", "TravelTech", "SportTech",
  "FashionTech", "LegalTech", "HRTech", "Media & Creator Economy", "Gaming",
  "IoT", "Biotech",
];

interface EntrepreneurStep2FormProps {
  initialData: EntrepreneurEditProfile;
  onSuccess: () => void;
}

export function EntrepreneurStep2Form({ initialData, onSuccess }: EntrepreneurStep2FormProps) {
  const { refetch } = useAuth();

  const [profession, setProfession] = useState(initialData.profession ?? "");
  const [level, setLevel] = useState(initialData.level ?? "");
  const [domains, setDomains] = useState<string[]>(
    initialData.domains.map((d) => d.domain.name),
  );
  const [skills, setSkills] = useState<string[]>(
    initialData.user.skills.map((s) => s.skill.name),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (domains.length === 0) {
      toast.error("Merci de sélectionner au moins un domaine d'intérêt");
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.updateEntrepreneurProfile({ profession, level, domains, skills });
      toast.success("Profil mis à jour");
      await refetch();
      onSuccess();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      toast.error("Erreur lors de la mise à jour", {
        description: axiosError.response?.data?.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Profession actuelle" icon={<BriefcaseBusinessIcon />}>
        <ChoicePills
          options={PROFESSIONS}
          value={profession}
          onChange={(value) => setProfession(value as string)}
        />
      </SectionCard>

      <SectionCard title="Niveau entrepreneurial" icon={<UsersRound />}>
        <RadioChoices options={LEVELS} value={level} onChange={setLevel} />
      </SectionCard>

      <SectionCard title="Domaines d'intérêt" icon={<PenLine />}>
        <ChoicePills
          options={DOMAINS}
          value={domains}
          onChange={(value) => setDomains(value as string[])}
          multiple
          showCheck
        />
      </SectionCard>

      <SectionCard title="Compétences" icon={<Sparkles />}>
        <SkillsInput value={skills} onChange={setSkills} />
      </SectionCard>

      <Button onClick={handleSubmit} variant="default" className="w-full mt-4">
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}