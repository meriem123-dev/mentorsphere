export type PostTag = "MILESTONE" | "QUESTION" | "UPDATE";

export interface PostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  avatarUrl?: string | null;
  avatarColor?: string;
}

export interface Post {
  id: string;
  content: string;
  tag: PostTag | null;
  author: PostAuthor;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLikedByMe: boolean;
  isSavedByMe: boolean;
  createdAt: string;
}

export interface CreatePostPayload {
  content: string;
  tag?: PostTag;
}

export interface PostsPage {
  posts: Post[];
  nextCursor: string | null;
}

export interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    company: string | null;
    avatarUrl: string | null;
    avatarColor: string | null;
  };
}