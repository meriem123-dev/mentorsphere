
"use client";

import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/authAPI";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();

  return async () => {
    try {
      await authApi.logout();
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };
}