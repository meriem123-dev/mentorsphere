"use client";

import { motion, Variants } from "framer-motion";
import { UserRound, Compass, Rocket, type LucideIcon } from "lucide-react";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}


//list steps
const steps: Step[] = [
  {
    number: "01",
    icon: UserRound,
    title: "Créez votre profil",
    description: "Décrivez votre idée, votre stade et vos objectifs.",
  },
  {
    number: "02",
    icon: Compass,
    title: "Trouvez votre mentor",
    description: "Parcourez l'annuaire et sélectionnez le profil qui vous convient.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Construisez ensemble",
    description: "Votre workspace est créé. Planifiez, documentez et progressez avec votre mentor.",
  },
];


//animations
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};


//mon cmpst
export function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-background" id="how">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="text-center mb-20 space-y-4"
        >
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-[0.2em] text-brand-blue uppercase">
            Comment ça marche
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            3 étapes vers
            <br />
            votre premier mentor.
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
        >
          {/* Ligne de connexion horizontale, desktop uniquement, derrière les icônes */}
          <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-border" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.number} variants={fadeUp} className="relative flex flex-col items-center text-center">
                {/* Icône + badge numéro */}
                <div className="relative mb-5 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-card border-2 border-brand-rose text-brand-rose text-[10px] font-bold">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-[240px]">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}