"use client"
import NextLink from "next/link";
import { Users } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { RecommendedMentor } from "@/types/dashTypes";

export function RecommendedMentors({ mentors }: { mentors: RecommendedMentor[] }) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Mentors Recommandés</h3>
      </div>

      <ul className="flex flex-col gap-3">
        {mentors.map((mentor) => (
          <li key={mentor.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
             <UserAvatar user={mentor} accent={"rose"} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{mentor.name}</p>
                <p className="truncate text-xs text-muted-foreground">{mentor.title}</p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full bg-brand-blue px-4 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              Demander
            </button>
          </li>
        ))}
      </ul>

      <NextLink
        href="/entrepreneur/mentors"
        className="mt-3 self-start text-sm font-medium text-[#13496B] hover:underline"
      >
        Voir tous les mentors 
      </NextLink>
    </div>
  );
}