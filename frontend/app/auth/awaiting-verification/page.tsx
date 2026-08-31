import { AwaitingVerificationStatus } from "@/features/auth/components/AwaitingVerificationStatus";

export default function AwaitingVerificationPage() {
  return (
    <div className="min-h-screen flex">
      <AwaitingVerificationStatus />
    </div>
  );
}