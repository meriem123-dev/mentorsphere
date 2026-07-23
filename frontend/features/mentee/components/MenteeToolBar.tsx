"use client";

import { Search } from "lucide-react";
import type { MenteeStatus, SortKey } from "../../../types/mentoratTypes";
import { ComboBox } from "@/components/ui/ComboBox";

interface MenteesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: MenteeStatus | "tous";
  onStatusFilterChange: (value: MenteeStatus | "tous") => void;
  sortKey: SortKey;
  onSortKeyChange: (value: SortKey) => void;
  resultCount: number;
}

const statusOptions: { value: MenteeStatus | "tous"; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "actif", label: "Actifs" },
  { value: "inactif", label: "Inactifs" },
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Vus récemment" },
  { value: "progression", label: "Progression" },
  { value: "name", label: "Nom (A-Z)" },
];

export function MenteesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortKey,
  onSortKeyChange,
  resultCount,
}: MenteesToolbarProps) {
  const currentSortLabel =
    sortOptions.find((o) => o.value === sortKey)?.label ?? sortOptions[0].label;

  const handleSortChange = (label: string) => {
    const found = sortOptions.find((o) => o.label === label);
    if (found) {
      onSortKeyChange(found.value);
    }
  };

  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un mentoré ou un projet "
          className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-rose/40"
        />
      </div>

      <div className="lg:flex items-center gap-3 grid grid-cols-1">
        <div className="flex items-center rounded-xl border border-border bg-card p-1">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusFilterChange(option.value)}
              className={
                statusFilter === option.value
                  ? "rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="w-44">
          <ComboBox
            label="Trier par"
            hideLabel
            value={currentSortLabel}
            onChange={handleSortChange}
            options={sortOptions.map((o) => o.label)}
            searchable={false}
            size="sm"
          />
        </div>
      </div>

      <span className="hidden text-xs text-muted-foreground sm:block">
        {resultCount} mentoré{resultCount > 1 ? "s" : ""}
      </span>
    </div>
  );
}
