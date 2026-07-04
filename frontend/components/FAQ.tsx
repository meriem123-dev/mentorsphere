"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Comment fonctionne le matching avec un mentor ?",
    answer:
      "Notre IA analyse votre stade de startup, votre secteur, vos objectifs et votre style de travail pour proposer les mentors les plus adaptés. Vous pouvez aussi parcourir l'annuaire complet.",
  },
  {
    question: "Qu'est-ce que le Mentorship Workspace ?",
    answer:
      "C'est l'espace privé créé automatiquement entre vous et votre mentor : chat en temps réel, objectifs partagés, documents, sessions planifiées et résumés générés par l'IA après chaque réunion.",
  },
  {
    question: "MentorSphere est-il gratuit ?",
    answer:
      "Oui. Cette première version est entièrement gratuite pour les fondateurs et les mentors. Nous prévoyons d'introduire des fonctionnalités premium à l'avenir.",
  },
  {
    question: "Puis-je modifier mes informations personnelles après mon inscription ?",
    answer:
      "Oui. Vous pouvez mettre à jour votre profil, vos compétences, votre photo et vos informations personnelles à tout moment depuis les paramètres de votre compte.",
  },
  {
    question: "Puis-je changer de mentor ?",
    answer:
      "Oui, à tout moment. Vous pouvez mettre fin à un mentorat depuis votre espace et relancer une recherche ou solliciter une nouvelle recommandation de l'IA.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 bg-background" id="faq">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="text-center mb-14 space-y-3"
        >
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-[0.2em] text-brand-rose uppercase">
            FAQ
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Questions fréquentes.
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="flex flex-col gap-3"
        >
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
                variants={fadeUp}
                className={cn(
                  "rounded-2xl border transition-colors",
                  isOpen ? "border-border bg-card" : "border-border/60 bg-muted/30"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground">{item.question}</span>
                  <span
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors",
                      isOpen ? "bg-brand-blue text-white" : "bg-background border border-border text-muted-foreground"
                    )}
                  >
                    {isOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}