"use client";

import { motion } from "framer-motion";

interface RadioCardGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}


//mon cmpst
export function RadioChoices({ options, value, onChange }: RadioCardGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-colors ${
              active
                ? "bg-primary/5 border-primary"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <span
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                active ? "border-primary" : "border-input"
              }`}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                />
              )}
            </span>
            <span className={`text-sm font-medium ${active ? "text-foreground" : "text-foreground/80"}`}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}