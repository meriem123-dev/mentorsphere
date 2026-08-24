"use client";

import { CommunityFeed } from "@/features/community/components/CommunityFeed";
import { useAuth } from "@/context/AuthContext";

export default function CommunityPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Chargement...
      </div>
    );
  }

  return (
    <CommunityFeed
      currentUser={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.profilePicture,
        avatarColor: user.coverPicture,
      }}
    />
  );
}