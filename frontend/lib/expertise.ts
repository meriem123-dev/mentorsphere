import {
  Compass,
  Package,
  TrendingUp,
  Handshake,
  Landmark,
  Rocket,
  Users,
  Code2,
  Palette,
  Settings2,
  Scale,
  UserCog,
  BrainCircuit,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const EXPERTISE_DOMAINS = [
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

export type ExpertiseDomain = (typeof EXPERTISE_DOMAINS)[number];

// Cycle de 4 tokens de la palette 
const PALETTE_CYCLE = ["bg-brand-blue", "bg-brand-rose", "bg-success", "bg-brand-blue-light"] as const;
const ACCENT_CYCLE = ["blue", "rose"] as const;

export const EXPERTISE_STYLES: Record<
  ExpertiseDomain,
  { icon: LucideIcon; dot: string; accent: "blue" | "rose" }
> = {
  "Stratégie & Business": { icon: Compass, dot: PALETTE_CYCLE[0], accent: ACCENT_CYCLE[0] },
  "Développement produit": { icon: Package, dot: PALETTE_CYCLE[1], accent: ACCENT_CYCLE[1] },
  "Marketing & Growth": { icon: TrendingUp, dot: PALETTE_CYCLE[2], accent: ACCENT_CYCLE[0] },
  "Vente & Business Development": { icon: Handshake, dot: PALETTE_CYCLE[3], accent: ACCENT_CYCLE[1] },
  Finance: { icon: Landmark, dot: PALETTE_CYCLE[0], accent: ACCENT_CYCLE[0] },
  "Levée de fonds": { icon: Rocket, dot: PALETTE_CYCLE[1], accent: ACCENT_CYCLE[1] },
  "Leadership & Management": { icon: Users, dot: PALETTE_CYCLE[2], accent: ACCENT_CYCLE[0] },
  "Technologie & Développement": { icon: Code2, dot: PALETTE_CYCLE[3], accent: ACCENT_CYCLE[1] },
  "UX/UI Design": { icon: Palette, dot: PALETTE_CYCLE[0], accent: ACCENT_CYCLE[1] },
  Opérations: { icon: Settings2, dot: PALETTE_CYCLE[1], accent: ACCENT_CYCLE[0] },
  Juridique: { icon: Scale, dot: PALETTE_CYCLE[2], accent: ACCENT_CYCLE[1] },
  "Ressources humaines": { icon: UserCog, dot: PALETTE_CYCLE[3], accent: ACCENT_CYCLE[0] },
  "Data & IA": { icon: BrainCircuit, dot: PALETTE_CYCLE[0], accent: ACCENT_CYCLE[1] },
  Cybersécurité: { icon: ShieldCheck, dot: PALETTE_CYCLE[1], accent: ACCENT_CYCLE[0] },
};

export function getDomainBadgeClasses(dot: string): string {
  const colorToken = dot.replace(/^bg-/, "");
  return `bg-${colorToken}/10 text-${colorToken}`;
}

export function resolveExpertiseDomain(raw: string): ExpertiseDomain | null {
  const normalized = raw.trim().toLowerCase();
  const match = EXPERTISE_DOMAINS.find((d) => d.toLowerCase() === normalized);
  return match ?? null;
}