"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X,Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkillsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}


//mon cmpst
export function SkillsInput({ value, onChange, placeholder = "Ex. React" }: SkillsInputProps) {
  const [draft, setDraft] = useState("");

  const addSkill = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-1.5 rounded-2xl border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <Button
          type="button"
          onClick={addSkill}
          variant={"default"}
          className="shrink-0 px-2 sm:px-4"
        >
          <Plus size={12} className="sm:hidden" />
          <span className="hidden sm:inline">Ajouter</span>
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          <AnimatePresence>
            {value.map((skill) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-foreground"
              >
                {skill}
                <Button
                  type="button"
                  onClick={() => removeSkill(skill)}
                 variant={"link"}
                >
                  <X size={14} />
                </Button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}