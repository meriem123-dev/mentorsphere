"use client";

import { motion, Variants } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const columns: FooterColumn[] = [
  {
    title: "Plateforme",
    links: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Mentors", href: "#mentors" },
      { label: "Communauté", href: "#community" },
      { label: "Ressources", href: "#resources" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Mentions légales", href: "/mentions-legales" },
    ],
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="border-t border-border bg-background px-4"
    >
      <div className="max-w-6xl mx-auto py-16">
        <div className="flex flex-col md:flex-row md:justify-between gap-12">
          {/* Logo + tagline */}
          <motion.div variants={fadeUp} className="max-w-xs">
            <Logo />
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed mb-5">
              La plateforme qui transforme les idées en startups qui réussissent.
            </p>

            <a href="mailto:mentorsphere.platform@gmail.com" className="text-sm text-brand-rose hover:text-primary/80 transition-colors">
              Nous contacter
            </a>
          </motion.div>

          {/* Colonnes de liens */}
          <div className="flex gap-16">
            {columns.map((col) => (
              <motion.div key={col.title} variants={fadeUp}>
                <p className="text-sm font-semibold text-foreground mb-4">{col.title}</p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      
                       <a href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Séparateur + copyright */}
        <motion.div variants={fadeUp} className="mt-14 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {year} MentorSphere. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}