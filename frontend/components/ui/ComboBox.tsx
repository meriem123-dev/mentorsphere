"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Check } from "lucide-react";

interface ComboBoxProps {
  label: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  searchable?: boolean;
}


//mon cmpst select plus moderne
export const ComboBox = ({
  label,
  placeholder = "Sélectionnez une option",
  options,
  value,
  onChange,
  error,
  searchable = true,
}: ComboBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  //
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);


  //rendu
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>

      <div className="relative" ref={comboboxRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 rounded-2xl border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all flex items-center justify-between ${
            error ? "border-destructive" : "border-input"
          }`}
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value || placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} className="text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-input rounded-2xl shadow-lg z-50"
            >
              {searchable && (
                <div className="p-3 border-b border-input">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Rechercher..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-foreground"
                    />
                  </div>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto overflow-y">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <motion.button
                      key={option}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className=" bg-background w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted transition"
                    >
                      <span className="text-foreground">{option}</span>
                      {value === option && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Check size={18} className="text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                    Aucune option trouvée
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          className="mt-1 text-sm text-destructive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

ComboBox.displayName = "ComboBox";