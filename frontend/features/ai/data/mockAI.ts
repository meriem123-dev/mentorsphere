import type { AISummaryResult, MentorMatch } from "../../../types/aiTypes";

export const MOCK_AI_SUMMARY: AISummaryResult = {
  healthScore: 72,
  healthScoreDelta: "+4pts cette semaine",
  kpis: [
    { label: "Objectifs en cours", value: "68%", delta: "+12pts", deltaTrend: "up", source: "computed" },
    { label: "Étapes roadmap", value: "5/9", delta: "+1", deltaTrend: "up", source: "computed" },
    { label: "Tâches en retard", value: "3", delta: "+1", deltaTrend: "down", source: "computed" },
    { label: "Sessions tenues", value: "4/5", delta: "80%", deltaTrend: "up", source: "computed" },
  ],
  sessionsSummary: null,
  synthesis:
    "NovaPay progresse bien sur ses objectifs (68%) et la roadmap avance (5 étapes sur 9 complétées). Le point de vigilance est le retard accumulé sur 3 tâches. La priorité de la semaine est de résorber ce retard avant la prochaine session.",
  alerts: [
    { id: "1", severity: "warning", message: "3 tâches sont en retard depuis plus de 5 jours." },
    { id: "2", severity: "info", message: "Aucune session planifiée cette semaine avec le mentor." },
  ],
  generatedAt: new Date().toISOString(),
};

export const MOCK_MENTOR_MATCHES: MentorMatch[] = [
  {
    id: "1", name: "Karim Diallo", initials: "KD", role: "Fondateur PawaPay", company: "Investisseur",
    description: "A construit une plateforme B2B similaire. Connaissance opérationnelle du marché cible.",
    tags: ["OPS", "GTM", "LEVÉE"], matchScore: 88, availability: "available",
  },
  {
    id: "2", name: "Léa Fontaine", initials: "LF", role: "Partner Partech", company: "Ex-banquière",
    description: "Ouvre des portes côté institutionnel. Pertinente pour la phase de levée seed.",
    tags: ["FINANCE", "TERM SHEET"], matchScore: 76, availability: "busy",
  },
  {
    id: "3", name: "Sofia Meziane", initials: "SM", role: "Ex-Product Lead", company: "Fintech mobile",
    description: "Expertise directe en fintech mobile. Aide à structurer le roadmap produit.",
    tags: ["PRODUCT", "FINTECH", "SCALE"], matchScore: 91, availability: "available",
  },
];