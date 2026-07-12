"use client"
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps{
    label:string;
    value:string|number;
    delta?:string;
    deltaTone?:"positive"|"neutral";
    Icon:LucideIcon;
    IconBg:string;
}

export function StatCard({
    label,value,delta,deltaTone="positive",Icon,IconBg}:StatCardProps
){
    return (
            <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white",
          IconBg
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {delta && (
          <p
            className={cn(
              "text-xs font-medium",
              deltaTone === "positive" ? "text-success" : "text-muted-foreground"
            )}
          >
            {delta}
          </p>
        )}
      </div>
    </div>
    )
}