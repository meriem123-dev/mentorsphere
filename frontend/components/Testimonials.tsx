"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { publicApi } from "@/features/landing/api/publicAPI";
import type { Testimonial } from "@/types/publicTypes";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await publicApi.getTestimonials(3);
        if (!cancelled) setTestimonials(res.testimonials);
      } catch (error) {
        console.error("getTestimonials error:", error);
        if (!cancelled) setTestimonials([]);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (testimonials.length === 0) return null;

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
              key={t.id}
              variants={fadeUp}
              className="rounded-2xl bg-gradient-brand backdrop-blur-sm border border-white/15 p-7 flex flex-col"
            >
              <span className="font-serif text-5xl leading-none text-white/50 mb-3 select-none">&ldquo;</span>
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