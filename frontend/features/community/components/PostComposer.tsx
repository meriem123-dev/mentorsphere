"use client";

import { useState } from "react";
import { toast } from "sonner";
import { communityApi } from "../api/communityAPI";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials, getAvatarColor } from "@/lib/avatar";
import type { Post } from "../../../types/communityTypes";

interface PostComposerProps {
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    avatarColor?: string | null;
  };
  onPostCreated: (post: Post) => void;
}

export function PostComposer({ currentUser, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = getInitials(currentUser.firstName, currentUser.lastName);
  const avatarColor = currentUser.avatarColor ?? getAvatarColor(currentUser.id);

  async function handlePublish() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const post = await communityApi.create({ content: trimmed });
      onPostCreated(post);
      setContent("");
    } catch (error) {
      toast.error("erreur lors de la publication du post");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Avatar avatarUrl={currentUser.avatarUrl} avatarColor={avatarColor} initials={initials} size="lg" />
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handlePublish();
          }
        }}
        placeholder="Partagez une mise à jour, posez une question, célébrez un succès..."
        className="min-w-0 flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        onClick={handlePublish}
        disabled={isSubmitting || !content.trim()}
        className="shrink-0 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        Publier
      </button>
    </div>
  );
}