import { Sparkles, Loader2 } from "lucide-react";
import type { AISuggestion } from "@/types/dashTypes";

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onRegenerate: () => void;
  isGenerating: boolean;
  attemptsRemaining: number;
}

export function AISuggestions({ suggestions, onRegenerate, isGenerating, attemptsRemaining }: AISuggestionsProps) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#A31C44]" />
        <h3 className="font-semibold">Suggestions IA</h3>
      </div>

      {suggestions.length === 0 && !isGenerating ? (
        <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
          Aucune suggestion pour l&lpos;instant. Génère-en une pour ce mentorat.
        </p>
      ) : (
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
      )}

      <button
        type="button"
        onClick={onRegenerate}
        disabled={isGenerating || attemptsRemaining === 0}
        className="mt-3 flex items-center gap-1.5 self-start text-sm font-medium text-brand-rose hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {suggestions.length === 0 ? "Générer des suggestions" : "Régénérer"}
      </button>
    </div>
  );
}