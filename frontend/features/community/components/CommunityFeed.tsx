"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { communityApi } from "../api/communityAPI";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import type { Post } from "../../../types/communityTypes";

interface CommunityFeedProps {
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    avatarColor?: string | null;
  };
}

export function CommunityFeed({ currentUser }: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      try {
        const page = await communityApi.list();
        if (cancelled) return;
        setPosts(page.posts);
        setNextCursor(page.nextCursor);
      } catch (error) {
        if (!cancelled) toast.error("erreur lors du chargement du feed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const page = await communityApi.list(nextCursor);
      setPosts((prev) => [...prev, ...page.posts]);
      setNextCursor(page.nextCursor);
    } catch (error) {
      toast.error("impossible de chager la suite");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handlePostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PostComposer currentUser={currentUser} onPostCreated={handlePostCreated} />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Chargement...</div>
      ) : posts.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Aucune publication pour le moment. Soyez le premier à partager quelque chose !
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} />)
      )}

      {nextCursor && (
        <button
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="mx-auto rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {isLoadingMore ? "Chargement..." : "Voir plus"}
        </button>
      )}
    </div>
  );
}