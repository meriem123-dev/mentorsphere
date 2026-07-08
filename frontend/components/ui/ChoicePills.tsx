"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ChoicePillsProps {
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  showCheck?: boolean;
  columns?: "auto" | "wrap";
}


//mon cmpst multichoix
export function ChoicePills({
  options,
  value,
  onChange,
  multiple = false,
  showCheck = false,
  columns = "wrap",
}: ChoicePillsProps) {
  const isActive = (option: string) =>
    multiple ? (value as string[]).includes(option) : value === option;

  const handleClick = (option: string) => {
    if (multiple) {
      const current = value as string[];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      onChange(updated);
    } else {
      onChange(option);
    }
  };

  //rendu
  return (
    <div
      className={
        columns === "wrap"
          ? "flex flex-wrap gap-2"
          : "grid grid-cols-2 sm:grid-cols-3 gap-2"
      }
    >
      {options.map((option, i) => {
        const active = isActive(option);
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => handleClick(option)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {active && showCheck && <Check size={14} />}
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}