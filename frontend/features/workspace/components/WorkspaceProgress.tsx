
type Props = { progress: number };

export function WorkspaceProgress({ progress }: Props) {
  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-foreground">Progression globale</span>
        <span className="font-semibold text-foreground">{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-gradient-brand transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}