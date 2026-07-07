"use client";

import { ProfileForm } from "./ProfileForm";
import { Logo } from "@/components/ui/Logo";

export function ProfileCompletionStep1() {
  return (
    <div className="w-full min-h-screen bg-background ">
      {/* Logo */}
      <div className="flex items-center gap-4 py-4 px-4">
        <div className="block md:hidden">
          <Logo compact className="w-28" />
        </div>
        <div className="hidden md:block">
          <Logo />
        </div>
      </div>
      <ProfileForm />
    </div>
  );
}
