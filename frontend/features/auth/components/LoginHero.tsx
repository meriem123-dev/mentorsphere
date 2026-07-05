"use client";

import { motion, useReducedMotion,type Variants  } from "framer-motion";
import Image from "next/image";
import { Lightbulb, Users2, Handshake, Rocket } from "lucide-react";

const journey = [
  { icon: Lightbulb, label: "Idée" },
  { icon: Users2, label: "Mentorat" },
  { icon: Handshake, label: "Collaboration" },
  { icon: Rocket, label: "Startup" },
];

const stats = [
  { value: "500+", label: "mentors experts" },
  { value: "1 200+", label: "entrepreneurs actifs" },
];

export function LoginHero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };
  
  const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease,
    },
  },
};

const line: Variants = {
  hidden: {
    opacity: 0,
    y: "100%",
  },
  visible: {
    opacity: 1,
    y: "0%",
    transition: {
      duration: 0.7,
      ease,
    },
  },
};

  return (
    <motion.div
      className="relative hidden lg:flex w-1/2 flex-col  overflow-hidden px-14 py-16 bg-gradient-brand"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {/* Trame de fond */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Logo */}
      <motion.div variants={fadeUp} className="relative flex items-center justify-center">
        <Image src="/icone-logo.svg" alt="MentorSphere" width={300} height={300} />
      </motion.div>

      {/* Titre + signature "Startup Journey" */}
      <div className="relative flex py-18 items-center">
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-10">
          <div>
            <h1 className="text-[2.75rem] font-bold leading-[1.1] text-white">
              <span className="block overflow-hidden">
                <motion.span variants={line} className="block">
                  Transformez vos idées
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span variants={line} className="block">
                  en startups qui réussissent.
                </motion.span>
              </span>
            </h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-base leading-relaxed text-white/60"
            >
              Connectez-vous aux meilleurs mentors, avancez étape par étape et
              rejoignez une communauté d&apos;entrepreneurs passionnés.
            </motion.p>
          </div>

          {/* Startup Journey vertical */}
          <motion.div
            variants={fadeUp}
            className="relative hidden xl:flex flex-col items-center"
          >
            <svg width="2" height="280" className="absolute left-1/2 top-6 -translate-x-1/2">
              <motion.line
                x1="1"
                y1="0"
                x2="1"
                y2="280"
                stroke="#A31C44"
                strokeWidth="2"
                strokeDasharray="280"
                initial={{ strokeDashoffset: reduceMotion ? 0 : 280 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.4, delay: 0.6, ease: "easeInOut" }}
              />
            </svg>
            <div className="relative flex h-[280px] flex-col justify-between py-6">
              {journey.map((step) => (
                <motion.div
                  key={step.label}
                  variants={fadeUp}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                    <step.icon className="h-4 w-4 text-white" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm text-white/70">{step.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stat strip */}
      <motion.div
        variants={fadeUp}
        className="relative flex gap-8 border-t border-white/10 pt-6"
      >
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-2xl font-semibold text-white">{s.value}</div>
            <div className="text-xs uppercase tracking-wide text-white/50">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}