import  prisma  from "../lib/prisma";
import { Prisma, type PostTag } from "@prisma/client";

const PAGE_SIZE = 10;

interface CreatePostInput {
  content: string;
  tag?: PostTag;
}

const postInclude = {
  author: {
    include: {
      mentor: { select: { profession: true } },
      entrepreneur: { select: { profession: true } },
    },
  },
  _count: { select: { comments: true, likes: true, saves: true } },
} satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

function mapPostToDTO(
  post: PostWithRelations,
  likedPostIds: Set<string>,
  savedPostIds: Set<string>
) {
  const profession =
    post.author.mentor?.profession ?? post.author.entrepreneur?.profession ?? null;

  return {
    id: post.id,
    content: post.content,
    tag: post.tag,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      firstName: post.author.firstName,
      lastName: post.author.lastName,
      company: profession,
      avatarUrl: post.author.profilePicture,
      avatarColor: post.author.coverPicture,
    },
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    savesCount: post._count.saves,
    isLikedByMe: likedPostIds.has(post.id),
    isSavedByMe: savedPostIds.has(post.id),
  };
}

export async function listPosts(userId: string, cursor?: string) {
  const posts = await prisma.post.findMany({
    take: PAGE_SIZE + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });

  const hasMore = posts.length > PAGE_SIZE;
  const pagePosts = hasMore ? posts.slice(0, PAGE_SIZE) : posts;
  const postIds = pagePosts.map((p) => p.id);

  const [likes, saves] = await Promise.all([
    prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
    prisma.postSave.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
  ]);

  const likedPostIds = new Set(likes.map((l) => l.postId));
  const savedPostIds = new Set(saves.map((s) => s.postId));

  const lastPost: (typeof pagePosts)[number] | undefined = pagePosts[pagePosts.length - 1];

  return {
    posts: pagePosts.map((post) => mapPostToDTO(post, likedPostIds, savedPostIds)),
    nextCursor: hasMore && lastPost ? lastPost.id : null,
  };
}

export async function createPost(userId: string, input: CreatePostInput) {
  const post = await prisma.post.create({
    data: {
      content: input.content,
      authorId: userId,
      ...(input.tag !== undefined && { tag: input.tag }),
    },
    include: postInclude,
  });

  return mapPostToDTO(post, new Set(), new Set());
}

export async function toggleLike(postId: string, userId: string) {
  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { postId, userId } });
  }

  const likesCount = await prisma.postLike.count({ where: { postId } });

  return { liked: !existing, likesCount };
}

export async function toggleSave(postId: string, userId: string) {
  const existing = await prisma.postSave.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.postSave.delete({ where: { id: existing.id } });
  } else {
    await prisma.postSave.create({ data: { postId, userId } });
  }

  const savesCount = await prisma.postSave.count({ where: { postId } });

  return { saved: !existing, savesCount };
}


const commentInclude = {
  author: {
    include: {
      mentor: { select: { profession: true } },
      entrepreneur: { select: { profession: true } },
    },
  },
} satisfies Prisma.PostCommentInclude;

type CommentWithRelations = Prisma.PostCommentGetPayload<{ include: typeof commentInclude }>;

function mapCommentToDTO(comment: CommentWithRelations) {
  const profession =
    comment.author.mentor?.profession ?? comment.author.entrepreneur?.profession ?? null;

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.author.id,
      firstName: comment.author.firstName,
      lastName: comment.author.lastName,
      company: profession,
      avatarUrl: comment.author.profilePicture,
      avatarColor: comment.author.coverPicture,
    },
  };
}

export async function listComments(postId: string) {
  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: commentInclude,
  });

  return comments.map(mapCommentToDTO);
}

export async function createComment(postId: string, userId: string, content: string) {
  const comment = await prisma.postComment.create({
    data: { postId, authorId: userId, content },
    include: commentInclude,
  });

  return mapCommentToDTO(comment);
}