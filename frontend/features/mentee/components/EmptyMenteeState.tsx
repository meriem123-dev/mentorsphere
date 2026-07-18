import { Users } from "lucide-react";

export function EmptyMenteesState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        Aucun mentoré trouvé
      </h3>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Essayez un autre terme de recherche ou changez le filtre de statut.
      </p>
    </div>
  );
}