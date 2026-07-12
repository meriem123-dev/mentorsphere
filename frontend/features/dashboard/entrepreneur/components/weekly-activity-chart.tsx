"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { WeeklyActivityPoint } from "@/types/dashTypes";

export function WeeklyActivityChart({ data }: { data: WeeklyActivityPoint[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold">Activité cette semaine</h3>
          <p className="text-sm text-muted-foreground">Sessions & messages</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          7 derniers jours
        </span>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="--brand-blue" stopOpacity={0.35} />
                <stop offset="100%" stopColor="--brand-blue" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="hsl(var(--brand-blue))"
              strokeWidth={2.5}
              fill="url(#activityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}