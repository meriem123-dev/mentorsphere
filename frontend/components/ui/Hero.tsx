"use client";

import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Lightbulb,
  Users,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BackgroundGrid } from "@/components/ui/background-grid";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const illustrationVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 px-4 overflow-hidden" id="acceuil">
      <BackgroundGrid />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="space-y-4">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-rose" />
              Accompagnement humain + IA
            </motion.span>

            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.15,
                  }}
                  className="block"
                >
                  De l&apos;idée à la
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.28,
                  }}
                  className="block bg-gradient-brand bg-clip-text text-transparent pb-1"
                >
                  startup qui réussit.
                </motion.span>
              </span>
            </h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground max-w-md"
            >
              Transformez votre idée en réalité avec des mentors expérimentés.
              Obtenez les conseils et les ressources nécessaires pour lancer
              votre startup, étape par étape.
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="bg-gradient-brand hover:opacity-90 text-white gap-2"
            >
              Commencer
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              En savoir plus
            </Button>
          </motion.div>

          {/* Trust bar  */}
          <motion.div
            variants={fadeUp}
            className="flex items-end gap-6 pt-4 flex-wrap"
          >
            <div>
              <p className="text-2xl font-bold text-brand-blue tabular-nums">
                500+
              </p>
              <p className="text-sm text-muted-foreground">
                Startups accompagnées
              </p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  "from-brand-blue to-brand-blue-light",
                  "from-brand-rose to-brand-rose-light",
                  "from-brand-navy to-brand-blue",
                  "from-brand-rose-light to-brand-blue-light",
                ].map((grad, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br ${grad}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">10k+</span>{" "}
                entrepreneurs
              </p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold text-brand-blue tabular-nums">
                +50M
              </p>
              <p className="text-sm text-muted-foreground">
                Mentors expérimentés
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — Startup Journey, le différenciateur du produit, comme signature visuelle */}
        <motion.div
          variants={illustrationVariants}
          initial="hidden"
          animate="show"
          className="hidden lg:flex items-center justify-center relative h-[480px]"
        >
          <div className="relative w-full max-w-sm h-full rounded-3xl bg-gradient-hero p-8 flex items-center overflow-hidden">
            {/* Voile subtil pour donner de la profondeur au fond */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/10 pointer-events-none" />

            {/* Ligne verticale du chemin, tracée à l'apparition */}
            <svg
              className="absolute left-[52px] top-16 bottom-16 h-[calc(100%-8rem)]"
              width="4"
              viewBox="0 0 4 400"
              preserveAspectRatio="none"
              fill="none"
            >
              <motion.line
                x1="2"
                y1="0"
                x2="2"
                y2="375"
                stroke="white"
                strokeOpacity="0.25"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.5, ease: "easeInOut" }}
              />
              <motion.line
                x1="2"
                y1="0"
                x2="2"
                y2="260"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.7, ease: "easeInOut" }}
              />
            </svg>

            {/* Étapes */}
            <div className="relative flex flex-col justify-between h-full py-2 z-10">
              {[
                {
                  icon: Lightbulb,
                  label: "Idée validée",
                  state: "done" as const,
                },
                {
                  icon: Users,
                  label: "Mentor trouvé",
                  state: "done" as const,
                },
                {
                  icon: Rocket,
                  label: "MVP en cours",
                  state: "active" as const,
                  progress: "66%",
                },
                {
                  icon: TrendingUp,
                  label: "Levée de fonds",
                  state: "upcoming" as const,
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + i * 0.15 }}
                    className="flex items-center gap-4"
                  >
                    {/* Pastille */}
                    <div className="relative shrink-0">
                      {step.state === "active" && (
                        <motion.span
                          className="absolute inset-0 rounded-full bg-white/40"
                          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                      )}
                      <div
                        className={cn(
                          "relative flex items-center justify-center w-11 h-11 rounded-full border-2",
                          step.state === "done" &&
                            "bg-white text-brand-blue border-white",
                          step.state === "active" &&
                            "bg-white text-brand-rose border-white",
                          step.state === "upcoming" &&
                            "bg-white/10 text-white/60 border-white/30",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Label + détail */}
                    <div
                      className={cn(step.state === "upcoming" && "opacity-60")}
                    >
                      <p className="text-sm font-semibold text-white">
                        {step.label}
                      </p>
                      {step.state === "active" && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 h-1.5 rounded-full bg-white/25 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: step.progress }}
                              transition={{
                                duration: 1,
                                delay: 1.6,
                                ease: "easeOut",
                              }}
                              className="h-full rounded-full bg-white"
                            />
                          </div>
                          <span className="text-xs text-white/80 tabular-nums">
                            {step.progress}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
