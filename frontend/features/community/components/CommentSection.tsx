"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { communityApi } from "../api/communityAPI";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials, getAvatarColor } from "@/lib/avatar";
import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import type { PostComment } from "../../../types/communityTypes";

interface CommentSectionProps {
  postId: string;
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    avatarColor?: string | null;
  };
  onCommentAdded: () => void;
}

export function CommentSection({ postId, currentUser, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserInitials = getInitials(currentUser.firstName, currentUser.lastName);
  const currentUserAvatarColor = currentUser.avatarColor ?? getAvatarColor(currentUser.id);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setIsLoading(true);
      try {
        const data = await communityApi.listComments(postId);
        if (!cancelled) setComments(data);
      } catch (error) {
        if (!cancelled) toast.error("erreur lors du chargement des commentaires");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const comment = await communityApi.createComment(postId, trimmed);
      setComments((prev) => [...prev, comment]);
      setContent("");
      onCommentAdded();
    } catch (error) {
      toast.error("erreur lors de l'ajout du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      {isLoading ? (
        <div className="py-3 text-center text-xs text-muted-foreground">Chargement...</div>
      ) : comments.length === 0 ? (
        <div className="py-3 text-center text-xs text-muted-foreground">
          Aucun commentaire pour le moment.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const initials = getInitials(comment.author.firstName, comment.author.lastName);
            const avatarColor = comment.author.avatarColor ?? getAvatarColor(comment.author.id);

            return (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar
                  avatarUrl={comment.author.avatarUrl}
                  avatarColor={avatarColor}
                  initials={initials}
                  size="sm"
                />
                <div className="min-w-0 flex-1 rounded-2xl bg-muted px-3 py-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="truncate text-xs font-semibold">
                      {comment.author.firstName} {comment.author.lastName}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Avatar
          avatarUrl={currentUser.avatarUrl}
          avatarColor={currentUserAvatarColor}
          initials={currentUserInitials}
          size="sm"
        />
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Écrire un commentaire..."
          className="min-w-0 flex-1 rounded-full bg-muted px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="shrink-0 text-sm font-medium text-brand-blue disabled:opacity-50 cursor-pointer hover:opacity-80"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}