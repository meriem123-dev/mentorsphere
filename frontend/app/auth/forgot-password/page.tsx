import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { LoginHero } from "@/features/auth/components/LoginHero";

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full min-h-screen bg-background">
      <ForgotPasswordForm />
      <LoginHero />
    </div>
  );
}
