"use client";

import { motion, Variants } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  Route,
  Compass,
  Hash,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  tags?: string[];
  accent: "rose" | "navy";
  area: "big" | "ai" | "journey" | "explore" | "community";
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    title: "Mentorship Workspace",
    description:
      "Chaque relation de mentorat crée un espace privé complet : chat temps réel, objectifs partagés, documents, sessions planifiées et résumés IA automatiques.",
    tags: ["Chat", "Objectifs", "Documents", "Résumé IA", "Calendrier"],
    accent: "rose",
    area: "big",
  },
  {
    icon: Sparkles,
    title: "Assistant IA",
    description: "SWOT, roadmap, pitch review — votre co-fondateur IA.",
    accent: "rose",
    area: "ai",
  },
  {
    icon: Route,
    title: "Parcours Startup",
    description: "Timeline de l'idée au financement. Chaque étape trackée.",
    accent: "navy",
    area: "journey",
  },
  {
    icon: Compass,
    title: "Explorer",
    description: "Mentors, projets, entrepreneurs filtrés par secteur.",
    accent: "navy",
    area: "explore",
  },
  {
    icon: Hash,
    title: "Communauté",
    description: "Feed startup. Partagez, apprenez, célébrez.",
    accent: "rose",
    area: "community",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, // 2s était trop lent, corrigé à 0.6
  },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

// mapping area -> classe Tailwind arbitraire, appliquée uniquement à partir de lg
const areaClass: Record<Feature["area"], string> = {
  big: "lg:[grid-area:big]",
  ai: "lg:[grid-area:ai]",
  journey: "lg:[grid-area:journey]",
  explore: "lg:[grid-area:explore]",
  community: "lg:[grid-area:community]",
};

export function Features() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-background" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4"
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto w-8 h-[2px] rounded-full bg-brand-blue mb-2"
          />
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold tracking-[0.2em] text-brand-rose uppercase"
          >
            Fonctionnalités
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight px-2"
          >
            Tout pour construire
            <br />
            votre startup.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto px-2"
          >
            Une plateforme pensée pour l&apos;entrepreneur moderne — de l&apos;idée au
            financement.
          </motion.p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className={cn(
            "grid gap-4 grid-cols-1",
            "lg:grid-cols-3",
            "lg:[grid-template-areas:'big_big_ai'_'big_big_journey'_'explore_community_.']",
          )}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const isBig = feature.area === "big";
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className={cn(
                  "group rounded-2xl border border-border p-5 sm:p-6 transition-colors",
                  areaClass[feature.area],
                  isBig
                    ? "bg-brand-rose-light/10 flex flex-col justify-between gap-6 lg:gap-0"
                    : "bg-brand-blue-light/10",
                )}
              >
                <div>
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white",
                      feature.accent === "rose"
                        ? "bg-brand-rose"
                        : "bg-brand-navy",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3
                    className={cn(
                      "font-bold text-foreground mb-2",
                      isBig ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      "text-muted-foreground",
                      isBig ? "text-sm sm:text-base max-w-md" : "text-sm",
                    )}
                  >
                    {feature.description}
                  </p>
                </div>

                {feature.tags && (
                  <div className="flex flex-wrap gap-2 mt-2 lg:mt-6">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-background/80 text-foreground/80 border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mx-auto w-8 h-[2px] rounded-full bg-brand-blue mt-12 sm:mt-16" />
      </div>
    </section>
  );
}