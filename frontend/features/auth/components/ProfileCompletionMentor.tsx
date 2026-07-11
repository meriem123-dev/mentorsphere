"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import { MentorCompletionWizard } from "./MentorCompletionWizard";
import { Logo } from "@/components/ui/Logo";

export function ProfileCompletionMentor() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== "MENTOR") {
      router.replace("/dashboard");
      return;
    }
    if (user.profileCompleted) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "MENTOR" || user.profileCompleted) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="flex items-center gap-4 py-4 px-4">
        <div className="block md:hidden">
          <Logo compact className="w-28" />
        </div>
        <div className="hidden md:block">
          <Logo />
        </div>
      </div>
      <MentorCompletionWizard />
    </div>
  );
}