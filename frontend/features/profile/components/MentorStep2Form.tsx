"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { BriefcaseBusiness } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { RadioChoices } from "@/components/ui/RadioChoices";
import { SkillsInput } from "@/features/auth/components/SkillsInput";
import { Button } from "@/components/ui/button";
import { profileApi } from "@/features/profile/api/profileAPI";
import { useAuth } from "@/context/AuthContext";
import type { ApiErrorResponse } from "@/types/authTypes";
import type { MentorEditProfile } from "@/types/profile";

const EXPERTISE_DOMAINS = [
  "Stratégie & Business",
  "Développement produit",
  "Marketing & Growth",
  "Vente & Business Development",
  "Finance",
  "Levée de fonds",
  "Leadership & Management",
  "Technologie & Développement",
  "UX/UI Design",
  "Opérations",
  "Juridique",
  "Ressources humaines",
  "Data & IA",
  "Cybersécurité",
];

const EXPERIENCE_LEVELS = [
  { value: "1-3", label: "1 à 3 ans" },
  { value: "4-7", label: "4 à 7 ans" },
  { value: "8-15", label: "8 à 15 ans" },
  { value: "15+", label: "15 ans et plus" },
];

interface MentorStep2FormProps {
  initialData: MentorEditProfile;
  onSuccess: () => void;
}

export function MentorStep2Form({
  initialData,
  onSuccess,
}: MentorStep2FormProps) {
  const { refetch } = useAuth();

  const [profession, setProfession] = useState(initialData.profession ?? "");
  const [yearsOfExperience, setYearsOfExperience] = useState(
    initialData.yearsOfExperience ?? "",
  );
  const [domains, setDomains] = useState<string[]>(
    initialData.domains.map((d) => d.domain.name),
  );
  const [skills, setSkills] = useState<string[]>(
    initialData.user.skills.map((s) => s.skill.name),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!profession.trim() || profession.trim().length < 2) {
      toast.error("Merci de renseigner votre profession");
      return;
    }
    if (!yearsOfExperience) {
      toast.error("Merci de sélectionner vos années d'expérience");
      return;
    }
    if (domains.length === 0) {
      toast.error("Merci de sélectionner au moins un domaine d'expertise");
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.updateMentorProfile({
        profession: profession.trim(),
        yearsOfExperience,
        domains,
        skills,
      });
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
      <SectionCard icon={<BriefcaseBusiness size={16} />} title="Expérience">
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Profession actuelle *
            </label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ex: Fondateur & CEO chez..."
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Années d&apos;expérience *
            </label>
            <RadioChoices
              options={EXPERIENCE_LEVELS}
              value={yearsOfExperience}
              onChange={setYearsOfExperience}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Domaines d&apos;expertise *
            </label>
            <ChoicePills
              options={EXPERTISE_DOMAINS}
              value={domains}
              onChange={(val) => setDomains(val as string[])}
              multiple
              showCheck
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Compétences spécifiques
            </label>
            <SkillsInput
              value={skills}
              onChange={setSkills}
              placeholder="Ajouter une compétence et appuyer sur Entrée"
            />
          </div>
        </div>
      </SectionCard>

      <Button onClick={handleSubmit} variant="default" className="w-full mt-4">
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}