"use client";

import { motion } from "framer-motion";
import { Globe2, MapPin, Calendar, Languages as LanguagesIcon } from "lucide-react";
import { TextInput } from "./TextInput";
import { ComboBox } from "@/components/ui/ComboBox";
import SectionCard from "@/components/ui/SectionCard";
import { BaseProfileFormData } from "@/types/authTypes";


interface AboutSectionProps <T extends BaseProfileFormData> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}


//languages et pays statiques
const AVAILABLE_LANGUAGES = [
  "Arabe",
  "Français",
  "Anglais",
  "Tamazight",
  "Espagnol",
  "Italien",
  "Allemand",
  "Turc",
];

const COUNTRIES = [
  "Algérie",
  "France",
  "Maroc",
  "Tunisie",
  "Belgique",
  "Suisse",
  "Canada",
  "Espagne",
  "Italie",
  "Allemagne",
  "Royaume-Uni",
  "Émirats Arabes Unis",
  "Arabie Saoudite",
  "Égypte",
  "Sénégal",
  "Côte d'Ivoire",
  "Autre",
];


//mon cmpst
export default function AboutSection<T extends BaseProfileFormData>({
  formData,
  setFormData,
}: AboutSectionProps<T>) {
  const toggleLanguage = (language: string) => {
    const updated = formData.languages.includes(language)
      ? formData.languages.filter((l: string) => l !== language)
      : [...formData.languages, language];
    setFormData({ ...formData, languages: updated });
  };

  return (
    <div className="space-y-6">
        {/*bio*/ }
      <SectionCard icon={<Globe2 size={16} />} title="À propos de vous">
        <textarea
          placeholder="Décrivez-vous en quelques mots — vos passions, vos projets, ce qui vous motive..."
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full px-4 py-3 rounded-2xl border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all "
        />
      </SectionCard>

      {/*date de naiss*/ }
      <SectionCard icon={<Calendar size={16} />} title="Date de naissance">
        <TextInput
          label="Date de naissance (optionnel)"
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
        />
      </SectionCard>

       {/*pays et ville*/ }
      <SectionCard icon={<MapPin size={16} />} title="Localisation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ComboBox
            label="Pays"
            placeholder="Sélectionnez un pays"
            options={COUNTRIES}
            value={formData.country}
            onChange={(value) => setFormData({ ...formData, country: value })}
          />
          <TextInput
            label="Ville"
            placeholder="Ex. Béjaïa"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
      </SectionCard>

      {/*Langues*/ }
      <SectionCard icon={<LanguagesIcon size={16} />} title="Langues parlées">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_LANGUAGES.map((language, i) => {
            const active = formData.languages.includes(language);
            return (
              <motion.button
                key={language}
                type="button"
                onClick={() => toggleLanguage(language)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {language}
              </motion.button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {formData.languages.length} langue{formData.languages.length > 1 ? "s" : ""} sélectionnée
          {formData.languages.length > 1 ? "s" : ""}
        </p>
      </SectionCard>
    </div>
  );
}

