"use client";

import { motion, Variants } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "En trois semaines, mon idée floue est devenue un vrai plan d'action. Ma mentore m'a challengé sur mon pricing dès la première session.",
    name: "Yanis Kaddour",
    role: "Fondateur, idée validée",
  },
  {
    quote:
      "Le Workspace centralise tout : plus besoin de jongler entre Notion, WhatsApp et Zoom pour suivre mes 4 startups en mentorat.",
    name: "Sarah Belaïd",
    role: "Mentore, Growth & Levée de fonds",
  },
  {
    quote:
      "L'assistant IA a détecté un point faible dans mon pitch que même mon mentor n'avait pas vu. Les deux se complètent bien.",
    name: "Rayan Hamidi",
    role: "Fondateur, en recherche de financement",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export function Testimonials() {
  return (
    <section className="relative py-24 px-4 overflow-hidden" id="testimo">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="text-center mb-16 space-y-3"
        >
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Témoignages
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Ils l&apos;ont fait.
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className="rounded-2xl bg-gradient-brand backdrop-blur-sm border border-white/15 p-7 flex flex-col"
            >
              <span className="font-serif text-5xl leading-none text-white/50 mb-3 select-none">
                &ldquo;
              </span>
              <p className="text-sm text-white/90 leading-relaxed mb-6 flex-1">{t.quote}</p>
              <div className="h-px bg-white/20 mb-4" />
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-white/60">{t.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}