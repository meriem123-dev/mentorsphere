"use client"

import NextLink from "next/link";
import { ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ParcoursProgressProps {
  projectName: string;
  stage: string;
  progression: number; // 0-100
}

export function ParcoursProgress({ projectName, stage, progression }: ParcoursProgressProps) {
  const data = [
    { name: "done", value: progression },
    { name: "remaining", value: 100 - progression },
  ];

  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5">
      <div>
        <h3 className="font-semibold">Progression Parcours</h3>
        <p className="text-sm text-muted-foreground">
          {projectName} · {stage}
        </p>
      </div>

      <div className="relative mx-auto my-2 h-[160px] w-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={72}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill="hsl(var(--brand-rose))" />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{progression}%</span>
          <span className="text-xs text-muted-foreground">Vers le MVP</span>
        </div>
      </div>

      <NextLink
        href="/entrepreneur/projects"
        className="mt-auto flex items-center justify-center gap-1 text-sm font-medium text-[#13496B] hover:underline"
      >
        Voir le parcours
        <ChevronRight className="h-4 w-4" />
      </NextLink>
    </div>
  );
}