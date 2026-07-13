"use client";

import { Search } from "lucide-react";

export function ExploreSearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher mentors, projets, entrepreneurs…"
        className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:shadow-md focus:ring-2 focus:ring-brand-blue/30"
      />
    </div>
  );
}