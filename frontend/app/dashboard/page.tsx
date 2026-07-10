"use client";

import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/authAPI";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { refetch } = useAuth();

  const handleLogout = async () => {
    await authApi.logout();
    await refetch();
    router.push("/auth/login");
  };

  return (
    <div>
      WELCOME TO MENTORSPHERE
      <button onClick={handleLogout}>Logout (temp)</button>
    </div>
  );
}