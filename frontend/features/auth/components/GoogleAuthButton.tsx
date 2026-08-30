"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/authAPI";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/authTypes";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath, getProfileCompletionPath } from "@/lib/routes";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string | undefined;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "small" | "medium" | "large";
      width?: number;
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      locale?: string;
      shape:string;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

interface GoogleAuthButtonProps {
  // requis uniquement à l'inscription, pour créer le compte avec le bon rôle
  role?: "entrepreneur" | "mentor";
}

// charge le script Google Identity Services une seule fois pour toute l'app
let scriptLoadingPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Impossible de charger Google Identity Services"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export function GoogleAuthButton({ role }: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { refetch } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function handleCredentialResponse(response: GoogleCredentialResponse) {
      try {
        const res = await authApi.googleAuth({ idToken: response.credential, role });

        toast.success("Connexion réussie", {
          description: `Content de te revoir, ${res.data.user.firstName} !`,
        });

        await refetch();

        const user = res.data.user;
        if (!user.profileCompleted) {
          router.push(getProfileCompletionPath(user.role));
        } else {
          router.push(getDashboardPath(user.role));
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        toast.error("Connexion Google impossible", {
          description: axiosError.response?.data?.message || "Une erreur est survenue",
        });
      }
    }

    async function init() {
      try {
        await loadGoogleScript();
        if (cancelled || !buttonRef.current) return;

        window.google!.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google!.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: buttonRef.current.offsetWidth,
          text: role ? "signup_with" : "signin_with",
          locale: "fr",
          shape: "pill",
        });
      } catch (err) {
        console.error(err);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return <div ref={buttonRef} className="w-full flex justify-center" />;
}