"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { mentorApi } from "@/features/explore/api/mentorAPI";
import { MentorProfileView } from "@/features/profile/components/MentorProfileView";
import type { Mentor } from "@/types/mentorTypes";

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;

    mentorApi
      .getById(id)
      .then((res) => {
        if (!ignore) setMentor(res.mentor);
      })
      .catch((err) => {
        console.error("getMentorById error:", err);
        if (!ignore) setError(true);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          Profil introuvable ou erreur de chargement.
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <MentorProfileView mentor={mentor} />
    </div>
  );
}