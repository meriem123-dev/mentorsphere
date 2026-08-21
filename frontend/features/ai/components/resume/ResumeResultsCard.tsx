import type { AISummaryResult } from "../../../../types/aiTypes";

export function ResumeResultCard({ result }: { result: AISummaryResult }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-gradient-brand p-6 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">Santé globale</p>
          <p className="mt-2 text-4xl font-bold">
            {result.healthScore}<span className="text-lg font-normal text-white/50">/100</span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-accent" style={{ width: `${result.healthScore}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/60">{result.healthScoreDelta}</p>
        </div>

        <div className="rounded-2xl bg-gradient-brand p-6 text-white">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/60">KPIs clés</p>
          <div className="grid grid-cols-2 gap-4">
            {result.kpis.map((kpi) => (
              <div key={kpi.label}>
                <p className="text-xs text-white/60">{kpi.label}</p>
                <p className="text-xl font-semibold">{kpi.value}</p>
                <p className={`text-xs ${kpi.deltaTrend === "up" ? "text-success" : "text-brand-rose-light"}`}>{kpi.delta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-muted p-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-rose">Synthèse IA</p>
        <p className="text-sm leading-relaxed text-foreground">{result.synthesis}</p>
      </div>

      <div className="rounded-2xl border border-border p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Résumé des sessions
        </p>
        {result.sessionsSummary ? (
          <>
            <p className="mb-1 text-xs text-muted-foreground">
              {result.sessionsSummary.periodLabel} · {result.sessionsSummary.sessionsCount} session
              {result.sessionsSummary.sessionsCount > 1 ? "s" : ""}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{result.sessionsSummary.content}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun résumé disponible pour l&apos;instant. Les résumés apparaîtront ici après vos premières sessions de mentorat.
          </p>
        )}
      </div>

      {result.alerts.length > 0 && (
        <div className="rounded-2xl border border-border p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Alertes</p>
          <ul className="space-y-2">
            {result.alerts.map((alert) => (
              <li key={alert.id} className="flex items-start gap-2 text-sm">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  alert.severity === "critical" ? "bg-brand-rose" : alert.severity === "warning" ? "bg-amber-500" : "bg-brand-blue"
                }`} />
                <span className="text-foreground">{alert.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}