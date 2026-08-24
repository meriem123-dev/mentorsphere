"use client";

import { useState } from "react";
import { ThumbsUp, MessageCircle, Bookmark } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { communityApi } from "../api/communityAPI";
import { TagBadge } from "./TagBadge";
import { CommentSection } from "./CommentSection";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials, getAvatarColor } from "@/lib/avatar";
import type { Post } from "../../../types/communityTypes";

interface PostCardProps {
  post: Post;
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    avatarColor?: string | null;
  };
}

export function PostCard({ post, currentUser }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSavedByMe);
  const [savesCount, setSavesCount] = useState(post.savesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);

  const initials = getInitials(post.author.firstName, post.author.lastName);
  const avatarColor = post.author.avatarColor ?? getAvatarColor(post.author.id);

  async function handleToggleLike() {
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      const result = await communityApi.like(post.id);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error("impossible de liker le post");
    }
  }

  async function handleToggleSave() {
    const previousSaved = isSaved;
    const previousCount = savesCount;

    setIsSaved(!previousSaved);
    setSavesCount(previousSaved ? previousCount - 1 : previousCount + 1);

    try {
      const result = await communityApi.save(post.id);
      setIsSaved(result.saved);
      setSavesCount(result.savesCount);
    } catch (error) {
      setIsSaved(previousSaved);
      setSavesCount(previousCount);
      toast.error("erreur lors du save");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            avatarUrl={post.author.avatarUrl}
            avatarColor={avatarColor}
            initials={initials}
          />
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold">
              {post.author.firstName} {post.author.lastName}
            </span>
            {post.author.company && (
              <span className="truncate text-sm text-muted-foreground">
                · {post.author.company}
              </span>
            )}
            {post.tag && <TagBadge tag={post.tag} />}
          </div>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDistanceToNowStrict(new Date(post.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {post.content}
      </p>

      <div className="mt-4 flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-5">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${
              isLiked ? "text-brand-blue" : "hover:text-foreground"
            }`}
          >
            <ThumbsUp
              className="h-4 w-4"
              fill={isLiked ? "currentColor" : "none"}
            />
            {likesCount}
          </button>
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${
              showComments ? "text-brand-blue" : "hover:text-foreground"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            {commentsCount}
          </button>
        </div>
        <button
          onClick={handleToggleSave}
          className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${
            isSaved ? "text-brand-rose" : "hover:text-foreground"
          }`}
        >
          <Bookmark
            className="h-4 w-4"
            fill={isSaved ? "currentColor" : "none"}
          />
          {savesCount}
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
