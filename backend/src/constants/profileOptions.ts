//valeurs autorisées pour les champs à choix fermé

export const ALLOWED_AVATAR_COLORS = [
  "bg-brand-blue",
  "bg-brand-rose",
  "bg-brand-blue-light",
  "bg-brand-rose-light",
  "bg-gradient-brand",
  "bg-gradient-rose-fade",
] as const;

//source front: ExpertiseStep.tsx 
export const ALLOWED_MENTOR_DOMAINS = [
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
] as const;

//source front: EntrepreneurialJourneyStep.tsx
export const ALLOWED_ENTREPRENEUR_DOMAINS = [
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
] as const;

//source front: EntrepreneurialJourneyStep.tsx (PROFESSIONS) 
export const ALLOWED_ENTREPRENEUR_PROFESSIONS = [
  "Étudiant(e)",
  "Salarié(e)",
  "Freelance",
  "Entrepreneur(e)",
  "Autre",
] as const;

//source front: EntrepreneurialJourneyStep.tsx
export const ALLOWED_LEVELS = [
  "discovering",
  "idea",
  "prototype",
  "mvp",
  "startup",
] as const;

//source front: ExpertiseStep.tsx 
export const ALLOWED_YEARS_OF_EXPERIENCE = ["1-3", "4-7", "8-15", "15+"] as const;

//source front: SearchAvailabilityStep.tsx / AvailabilityLinksStep.tsx 
export const ALLOWED_AVAILABILITY = [
  "Jours de semaine",
  "Soirées",
  "Week-end",
] as const;

//source front: EntrepreneurialJourneyStep.tsx 
export const ALLOWED_LOOKING_FOR = [
  "find_mentor",
  "validate_idea",
  "business_model",
  "build_mvp",
  "find_cofounders",
  "networking",
  "fundraising",
  "find_investors",
  "legal_advice",
  "marketing_advice",
  "technical_advice",
  "skill_development",
  "startup_growth",
  "join_community",
] as const;

//normalise une valeur pour la comparaison 
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

//vérifie qu'une liste de valeurs est un sous-ensemble d'une liste autorisée

export function findInvalidValues(
  values: string[],
  allowed: readonly string[],
): string[] {
  const normalizedAllowed = allowed.map(normalize);
  return values.filter((v) => !normalizedAllowed.includes(normalize(v)));
}