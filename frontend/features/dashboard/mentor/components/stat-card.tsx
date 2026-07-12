
import type { StatCardData } from "../../../../types/dashTypes";


export function StatCard({ icon: Icon, label, value, delta, accent }: StatCardData) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white bg-gradient-brand`}>
        <Icon className="h-5 w-5" strokeWidth={2} color="white"/>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-xs font-medium text-success">{delta}</p>
      </div>
    </div>
  );
}