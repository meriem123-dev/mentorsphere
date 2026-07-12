
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, action, children, className = "" }: DashboardCardProps) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-7 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground mb-2">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}