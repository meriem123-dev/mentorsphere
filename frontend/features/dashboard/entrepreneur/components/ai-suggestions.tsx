import { Sparkles } from "lucide-react";
import type { AISuggestion } from "@/types/dashTypes";

export function AISuggestions({ suggestions }: { suggestions: AISuggestion[] }) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#A31C44]" />
        <h3 className="font-semibold">Suggestions IA</h3>
      </div>

      <ul className="flex flex-col gap-2">
        {suggestions.map((s) => (
          <li key={s.id} className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A31C44]/10">
              <Sparkles className="h-3.5 w-3.5 text-[#A31C44]" />
            </span>
            <p className="text-sm leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-3 self-start text-sm font-medium text-[#13496B] hover:underline"
      >
        Explorer plus de suggestions 
      </button>
    </div>
  );
}