// features/mentor-dashboard/components/sessions-activity-chart.tsx
"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { DashboardCard } from "./dashboard-card";
import type { SessionActivityPoint } from "@/types/dashTypes";

export function SessionsActivityChart({ data }: { data: SessionActivityPoint[] }) {
  return (
    <DashboardCard
      title="Activité Sessions"
      action={
        <span className="rounded-full bg-brand-rose/10 px-3 py-1 text-xs font-medium text-brand-rose">
          7 derniers jours
        </span>
      }
      className="lg:col-span-2"
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--brand-rose))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--brand-rose))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--brand-rose-light))" }}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="sessions" stroke="hsl(var(--brand-rose))" strokeWidth={2} fill="url(#sessionsFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}