import { api } from "@/lib/api";
import type {
  CreatePostPayload,
  Post,
  PostsPage,
  PostComment
} from "../../../types/communityTypes";

export const communityApi = {
  list: (cursor?: string) =>
    api
      .get<PostsPage>("api/community/posts", {
        params: cursor ? { cursor } : {},
      })
      .then((r) => r.data),

  create: (payload: CreatePostPayload) =>
    api.post<Post>("api/community/posts", payload).then((r) => r.data),

  like: (postId: string) =>
    api
      .post<{
        liked: boolean;
        likesCount: number;
      }>(`api/community/posts/${postId}/like`)
      .then((r) => r.data),

  save: (postId: string) =>
    api
      .post<{
        saved: boolean;
        savesCount: number;
      }>(`api/community/posts/${postId}/save`)
      .then((r) => r.data),
  listComments: (postId: string) =>
    api
      .get<PostComment[]>(`api/community/posts/${postId}/comments`)
      .then((r) => r.data),

  createComment: (postId: string, content: string, parentId?: string) =>
  api
    .post(`api/community/posts/${postId}/comments`, {
      content,
      ...(parentId !== undefined && { parentId }),
    })
    .then((res) => res.data as PostComment),
  
};
