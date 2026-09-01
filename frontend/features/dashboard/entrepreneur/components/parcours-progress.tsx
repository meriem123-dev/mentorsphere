"use client"

import NextLink from "next/link";
import { ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ComboBox } from "@/components/ui/ComboBox";

interface StartupOption {
  id: string;
  name: string;
}

interface ParcoursProgressProps {
  projectName: string;
  stage: string;
  progression: number; // 0-100
  startups: StartupOption[];
  selectedStartupId: string | null;
  onSelectStartup: (startupId: string) => void;
}

export function ParcoursProgress({
  projectName,
  progression,
  startups,
  selectedStartupId,
  onSelectStartup,
}: ParcoursProgressProps) {
  const data = [
    { name: "done", value: progression },
    { name: "remaining", value: 100 - progression },
  ];

  const selectedName = startups.find((s) => s.id === selectedStartupId)?.name ?? projectName;

  function handleChange(name: string) {
    const startup = startups.find((s) => s.name === name);
    if (startup) onSelectStartup(startup.id);
  }

  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold">Progression</h3>
          <p className="text-sm text-muted-foreground truncate">
            {projectName}
          </p>
        </div>

        {startups.length > 1 && (
          <div className="w-36 shrink-0">
            <ComboBox
              label="Projet"
              hideLabel
              size="sm"
              searchable={false}
              options={startups.map((s) => s.name)}
              value={selectedName}
              onChange={handleChange}
            />
          </div>
        )}
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
        </div>
      </div>

      <NextLink
        href={`/entrepreneur/parcours/${selectedStartupId}`}
        className="mt-auto flex items-center justify-center gap-1 text-sm font-medium text-brand-blue-light hover:underline"
      >
        Voir le parcours
        <ChevronRight className="h-4 w-4" />
      </NextLink>
    </div>
  );
}