import { Suspense } from "react";
import { VerifyEmailStatus } from "@/features/auth/components/VerifyEmailStatus";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex">
      <Suspense fallback={null}>
        <VerifyEmailStatus />
      </Suspense>
    </div>
  );
}