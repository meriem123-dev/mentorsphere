"use client";

import { motion } from "framer-motion";

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  columns?: 1 | 2;
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  columns = 2,
}: CheckboxGroupProps) {
  const toggle = (optionValue: string) => {
    const updated = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(updated);
  };

  return (
    <div
      className={`grid gap-3 ${
        columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {options.map((option, i) => {
        const checked = value.includes(option.value);
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
              checked
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                checked ? "bg-primary border-primary" : "border-input bg-transparent"
              }`}
            >
              {checked && (
                <svg viewBox="0 0 12 10" className="w-2.5 h-2.5" fill="none">
                  <path
                    d="M1 5L4.5 8.5L11 1.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm font-medium text-foreground">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}