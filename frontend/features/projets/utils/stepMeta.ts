import {
  Lightbulb,
  BarChart3,
  FlaskConical,
  Handshake,
  Rocket,
  Users,
  Wallet,
  TrendingUp,
  Flag,
  type LucideIcon,
} from "lucide-react";
import type { StartupStep } from "@/types/startupTypes";

export type StepStatus = "DONE" | "CURRENT" | "UPCOMING";

interface StepMeta {
  icon: LucideIcon;
  description: string;
}

// Correspondance par mot-clé — les titres restent libres côté utilisateur,
const STEP_META: { keyword: string; meta: StepMeta }[] = [
  { keyword: "idée", meta: { icon: Lightbulb, description: "Définissez votre idée de startup et votre proposition de valeur." } },
  { keyword: "marché", meta: { icon: BarChart3, description: "Validez votre marché et comprenez vos clients cibles." } },
  { keyword: "prototype", meta: { icon: FlaskConical, description: "Construisez une première version pour tester votre concept." } },
  { keyword: "mentor", meta: { icon: Handshake, description: "Trouvez un mentor expérimenté pour guider votre parcours." } },
  { keyword: "mvp", meta: { icon: Rocket, description: "Lancez votre Produit Minimum Viable." } },
  { keyword: "utilisateur", meta: { icon: Users, description: "Acquérez vos premiers vrais clients." } },
  { keyword: "revenu", meta: { icon: Wallet, description: "Générez vos premiers revenus." } },
  { keyword: "croissance", meta: { icon: TrendingUp, description: "Scalez votre startup." } },
];

const DEFAULT_META: StepMeta = {
  icon: Flag,
  description: "Étape personnalisée de votre parcours.",
};

export function getStepMeta(title: string): StepMeta {
  const lower = title.toLowerCase();
  return STEP_META.find((s) => lower.includes(s.keyword))?.meta ?? DEFAULT_META;
}

export function getStepStatus(steps: StartupStep[], index: number): StepStatus {
  const step = steps[index];
  if (step.completed) return "DONE";

  const anyCompleted = steps.some((s) => s.completed);
  if (!anyCompleted) return "UPCOMING";

  const firstIncompleteIndex = steps.findIndex((s) => !s.completed);
  return index === firstIncompleteIndex ? "CURRENT" : "UPCOMING";
}

export function getStepStats(steps: StartupStep[]) {
  const done = steps.filter((s) => s.completed).length;
  const current = steps.some((_, i) => getStepStatus(steps, i) === "CURRENT") ? 1 : 0;
  const upcoming = steps.length - done - current;
  const progressPercent = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;
  return { done, current, upcoming, progressPercent };
}

export const STATUS_LABEL: Record<StepStatus, string> = {
  DONE: "Terminé",
  CURRENT: "En cours",
  UPCOMING: "Non démarré",
};